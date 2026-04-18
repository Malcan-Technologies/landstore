import express from "express";
import type { Application } from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import db from "./config/prisma.js";
import { auth } from "./config/auth.js";
import { attachSocketServer } from "./src/socket/server.js";
import requireApiAuth from "./src/middleware/requireApiAuth.js";
import userRoutes from "./src/routes/user.routes.js";
import listLandRoutes from "./src/routes/listLand.routes.js";
import folderRoutes from "./src/routes/folders.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import ownershipRoutes from "./src/routes/ownership.routes.js";
import utilizationRoutes from "./src/routes/utilization.routes.js";
import titleTypeRoutes from "./src/routes/titleType.routes.js";
import enquiryRoutes from "./src/routes/enquiry.routes.js";
import interestTypeRoutes from "./src/routes/interestType.routes.js";
import entityTypeRoutes from "./src/routes/entityType.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import locationRoutes from "./src/routes/location.routes.js";
import leaseholdRoutes from "./src/routes/leasehold.routes.js";
import notificationPreference from "./src/routes/notificationPreference.routes.js"

const app: Application = express();
const httpServer = createServer(app);

/**
 * AUTHENTICATION ARCHITECTURE:
 * 
 * This application uses Better Auth for secure authentication.
 * Passwords are ALWAYS hashed before database storage.
 * 
 * UNIFIED REGISTRATION FLOW:
 * 1. POST /api/users/register (ONE endpoint for complete sign-up)
 *    {
 *      email, password, name, phone, userType,
 *      profileType, firstName, lastName, ...
 *    }
 *    → Better Auth hashes password (Account.password stores encrypted hash)
 *    → User created with email (no password field)
 *    → Profile completed (phone, userType, custom fields)
 *    → Returns full user profile
 * 
 * 2. POST /api/auth/sign-in (to get session/JWT)
 *    { email, password }
 *    → Better Auth verifies password against hashed Account.password
 *    → Session/JWT returned
 * 
 * 3. Protected Routes: All with requireApiAuth middleware use Better Auth sessions
 * 
 * ⚠️ PASSWORD SECURITY:
 * - Passwords ONLY accepted at /api/users/register or /api/auth endpoints
 * - Account.password stores ENCRYPTED hash (never plain text)
 * - User.password field removed entirely (removed for security)
 * - All errors return generic "Internal server error" on 500
 */

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

// Health check endpoint
app.get("/", (req: express.Request, res: express.Response) => {
	res.status(200).json({
		status: "ok",
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// User routes (protected and unprotected)
app.use("/api/users", userRoutes);

// Public routes (list-lands has auth on individual routes)
app.use("/api/list-lands", listLandRoutes);

// Protected routes (require authentication)
app.use("/api/folders", requireApiAuth, folderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ownership-types", requireApiAuth, ownershipRoutes);
app.use("/api/utilizations", utilizationRoutes);
app.use("/api/title-types", titleTypeRoutes);
app.use("/api/enquiries", requireApiAuth, enquiryRoutes);
app.use("/api/interest-types", interestTypeRoutes);
app.use("/api/entity-types", requireApiAuth, entityTypeRoutes);
app.use("/api/notifications", requireApiAuth, notificationRoutes);
app.use("/api/locations", requireApiAuth, locationRoutes);
app.use("/api/leaseholds", requireApiAuth, leaseholdRoutes);
app.use("/api/notification-preferences", notificationPreference)

// Global error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: Function) => {
  console.error("Unhandled error:", err);
  const statusCode = err?.statusCode || 500;
  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : err?.error || "Error",
    message: err?.message || "Internal server error",
  });
});

// Test database connection
db.$connect()
  .then(() => console.log("Connected to the database"))
  .catch((err: unknown) => console.error("Database connection error:", err));

attachSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});