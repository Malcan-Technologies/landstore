import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/prisma.ts";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./src/routes/user.routes.ts";

const app: Application = express();

const PORT: number | string = process.env.PORT || 5000;
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(clerkMiddleware());
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});
app.use("/api/users", userRoutes);

// Test database connection
db.$connect()
  .then(() => console.log("Connected to the database"))
  .catch((err: unknown) => console.error("Database connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});