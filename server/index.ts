import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import db from "./config/prisma.ts";
import { auth } from "./config/auth.ts";
import requireApiAuth from "./src/middleware/requireApiAuth.ts";
import userRoutes from "./src/routes/user.routes.ts";
import listLandRoutes from "./src/routes/listLand.routes.ts";
import folderRoutes from "./src/routes/folders.routes.ts";
import categoryRoutes from "./src/routes/category.routes.ts";
import ownershipRoutes from "./src/routes/ownership.routes.ts";
import utilizationRoutes from "./src/routes/utilization.routes.ts";
import titleTypeRoutes from "./src/routes/titleType.routes.ts";
import enquiryRoutes from "./src/routes/enquiry.routes.ts";
import interestTypeRoutes from "./src/routes/interestType.routes.ts";
import entityTypeRoutes from "./src/routes/entityType.routes.ts";
import notificationRoutes from "./src/routes/notification.routes.ts";

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

// IMPORTANT: Mount Better Auth handler BEFORE express.json()
// This handles all /api/auth/* endpoints (sign-up, sign-in, sign-out, etc.)
app.use("/api/auth", toNodeHandler(auth));

// Apply express.json() and other middleware AFTER Better Auth handler
app.use(express.json());
app.use(cookieParser());

// User routes (protected and unprotected)
app.use("/api/users", userRoutes);

// Protected routes (require authentication)
app.use("/api/list-lands", requireApiAuth, listLandRoutes);
app.use("/api/folders", requireApiAuth, folderRoutes);
app.use("/api/categories", requireApiAuth, categoryRoutes);
app.use("/api/ownership-types", requireApiAuth, ownershipRoutes);
app.use("/api/utilizations", requireApiAuth, utilizationRoutes);
app.use("/api/title-types", requireApiAuth, titleTypeRoutes);
app.use("/api/enquiries", requireApiAuth, enquiryRoutes);
app.use("/api/interest-types", requireApiAuth, interestTypeRoutes);
app.use("/api/entity-types", requireApiAuth, entityTypeRoutes);
app.use("/api/notifications", requireApiAuth, notificationRoutes);

// Test database connection
db.$connect()
  .then(() => console.log("Connected to the database"))
  .catch((err: unknown) => console.error("Database connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});