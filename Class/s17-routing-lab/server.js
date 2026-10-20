import express from 'express';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { AppError } from './utils/appError.js';
import { loadEnvFile } from 'node:process';
loadEnvFile();
const dbUser= process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const app = express();
const PORT = 3000;

const mongoUrl = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.mbqo1lg.mongodb.net/${dbName}`;
connectDB(mongoUrl);

// Body parser
app.use(express.json());

// TODO: Serve static files from the 'public' directory so index.html loads on http://localhost:3000
app.use(express.static('public'));

// TODO: Mount Routers
// Mount authRoutes on '/api/auth'
// Mount apiRoutes on '/api/'

app.use("/api", protect, apiRoutes);
app.use("/api/auth", requireAdmin, authRoutes);
app.post("/users", async (req, res, next) => {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    createUser({ username, name, email, password })
        .then((user) => res.status(201).json(user))
        .catch((error) => next(new AppError(error.message, 400)));
});

// 404 Unhandled Route Handler
app.all("/{*splat}", (req, res, next) => {
    next(new AppError(`Cannot find route ${req.originalUrl} on this server!`, 404));
});

// Centralized Global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`🚀 SustainHub Server running at http://localhost:${PORT}`);
});
