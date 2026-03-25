import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/prisma.ts";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./src/routes/user.routes.ts";
import listLandRoutes from "./src/routes/listLand.routes.ts";
import folderRoutes from "./src/routes/folders.routes.ts";
import categoryRoutes from "./src/routes/category.routes.ts";
import ownershipRoutes from "./src/routes/ownership.routes.ts";
import utilizationRoutes from "./src/routes/utilization.routes.ts";
import titleTypeRoutes from "./src/routes/titleType.routes.ts";

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


app.use("/api/users", userRoutes);
app.use("/api/list-lands", listLandRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ownership-types", ownershipRoutes);
app.use("/api/utilizations", utilizationRoutes);
app.use("/api/title-types", titleTypeRoutes);

// Test database connection
db.$connect()
  .then(() => console.log("Connected to the database"))
  .catch((err: unknown) => console.error("Database connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});