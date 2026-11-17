require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LOTR";
const sessionSecret = process.env.SESSION_SECRET;
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (!sessionSecret) {
  throw new Error("Falta SESSION_SECRET. Copia .env.example a .env y configura la clave.");
}

const userSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true },
  googleId: { type: String, sparse: true },
  secrets: [{ type: String, trim: true, maxlength: 300 }],
});
userSchema.plugin(passportLocalMongoose, { usernameLowerCase: true });

const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          `http://localhost:${PORT}/auth/google/secrets`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.create({
              username: `google_${profile.id}`,
              email: profile.emails?.[0]?.value,
              googleId: profile.id,
            });
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(sessionSecret));
app.use(
  session({
    name: "lotr.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const messages = {
  "auth-required": "Inicia sesión para ver esta página.",
  "google-unavailable": "El acceso con Google aún no está configurado.",
  "invalid-login": "El usuario o la contraseña no son correctos.",
  "invalid-registration": "Revisa los datos: el usuario debe estar disponible y la contraseña tener al menos 6 caracteres.",
  "invalid-secret": "Escribe un secreto de hasta 300 caracteres.",
  "google-login": "No se pudo iniciar sesión con Google.",
};

function requireAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/?message=auth-required");
}

function setWelcomeCookie(res) {
  res.cookie("welcome", "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
}

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/secrets");
  }

  const message = messages[req.query.message] || "";
  return res.render("index", { message, googleConfigured });
});

app.post("/register", async (req, res, next) => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim();
  const password = String(req.body.password || "");

  if (!username || !email || password.length < 6) {
    return res.redirect("/?message=invalid-registration");
  }

  try {
    const user = await User.register(new User({ username, email }), password);
    req.logIn(user, (error) => {
      if (error) {
        return next(error);
      }

      setWelcomeCookie(res);
      return res.redirect("/secrets");
    });
  } catch (error) {
    if (error.name === "UserExistsError" || error.name === "ValidationError") {
      return res.redirect("/?message=invalid-registration");
    }

    return next(error);
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.redirect("/?message=invalid-login");
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      setWelcomeCookie(res);
      return res.redirect("/secrets");
    });
  })(req, res, next);
});

app.get("/secrets", requireAuthentication, (req, res) => {
  res.render("secrets", {
    username: req.user.username,
    secrets: req.user.secrets,
    message: messages[req.query.message] || "",
    hasWelcomeCookie: Boolean(req.signedCookies.welcome),
  });
});

app.post("/secrets", requireAuthentication, async (req, res, next) => {
  const secret = String(req.body.secret || "").trim();
  if (!secret || secret.length > 300) {
    return res.redirect("/secrets?message=invalid-secret");
  }

  try {
    req.user.secrets.push(secret);
    await req.user.save();
    return res.redirect("/secrets");
  } catch (error) {
    return next(error);
  }
});

app.get("/auth/google", (req, res, next) => {
  if (!googleConfigured) {
    return res.redirect("/?message=google-unavailable");
  }

  return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
  "/auth/google/secrets",
  (req, res, next) => {
    if (!googleConfigured) {
      return res.redirect("/?message=google-unavailable");
    }

    return passport.authenticate("google", {
      failureRedirect: "/?message=google-login",
    })(req, res, next);
  },
  (req, res) => {
    setWelcomeCookie(res);
    res.redirect("/secrets");
  }
);

app.post("/logout", (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("lotr.sid");
      res.clearCookie("welcome", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res.redirect("/");
    });
  });
});

app.use((error, req, res, next) => {
  console.error("Error en la aplicación:", error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).send("Ocurrió un error. Revisa la terminal del servidor.");
});

async function startServer() {
  try {
    await mongoose.connect(mongoUrl);
    app.listen(PORT, () => {
      console.log(`Servidor listo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
