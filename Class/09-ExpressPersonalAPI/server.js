const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const names = [];
const tasks = [];

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "html"));
app.use(express.urlencoded({ extended: false }));

function showIndex(res, options = {}) {
  res.render("index", {
    names,
    tasks,
    greeting: "",
    error: "",
    ...options,
  });
}

function getTaskIndex(value) {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index >= tasks.length) {
    const error = new Error("No encontré esa tarea.");
    error.status = 404;
    throw error;
  }
  return index;
}

app.get("/", (req, res) => {
  const greeting =
    typeof req.query.greeting === "string" ? req.query.greeting : "";
  showIndex(res, { greeting });
});

app.get("/greet", (req, res) => {
  const name = (req.query.name || "").trim();

  if (!name) {
    return showIndex(res, { error: "Escribe tu nombre para poder saludarte." });
  }

  // Guardo los nombres mientras el servidor sigue encendido; todavía no usamos una base de datos.
  names.push(name);
  console.log("Nombre recibido:", name);
  res.redirect(303, `/?greeting=${encodeURIComponent(`¡Hola, ${name}!`)}`);
});

app.get("/greet/:index", (req, res, next) => {
  const index = Number(req.params.index);

  if (!Number.isInteger(index) || index < 0 || index >= names.length) {
    const error = new Error("No encontré ese nombre en la lista.");
    error.status = 404;
    return next(error);
  }

  res.render("wazzup", { name: names[index] });
});

app.put("/greet/:name", (req, res) => {
  const name = req.params.name.trim();

  if (!name) {
    return res.status(400).json({ error: "El nombre no puede estar vacío." });
  }

  names.push(name);
  res.json(names);
});

app.post("/task", (req, res, next) => {
  const task = (req.body.task || "").trim();

  if (!task) {
    return showIndex(res, { error: "Escribe una tarea antes de agregarla." });
  }

  tasks.push(task);
  res.redirect(303, "/");
});

app.get("/task", (req, res) => {
  res.json(tasks);
});

app.post("/task/:index/delete", (req, res, next) => {
  try {
    tasks.splice(getTaskIndex(req.params.index), 1);
    res.redirect(303, "/");
  } catch (error) {
    next(error);
  }
});

app.post("/task/:index/move/:direction", (req, res, next) => {
  try {
    const index = getTaskIndex(req.params.index);
    const destination = req.params.direction === "up" ? index - 1 : index + 1;

    if (
      !["up", "down"].includes(req.params.direction) ||
      destination < 0 ||
      destination >= tasks.length
    ) {
      return showIndex(res, { error: "La tarea ya está en ese extremo de la lista." });
    }

    // Intercambio las dos tareas para cambiar el orden sin complicar mucho el código.
    [tasks[index], tasks[destination]] = [tasks[destination], tasks[index]];
    res.redirect(303, "/");
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500);
  showIndex(res, {
    error: error.message || "Ocurrió un error inesperado.",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
