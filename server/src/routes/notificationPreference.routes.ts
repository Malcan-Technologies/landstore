import { Router } from "express";
import {
  createNotificationPreferenceController,
  getMyNotificationPreferenceController,
  getNotificationPreferenceByIdController,
  updateMyNotificationPreferenceController,
  deleteMyNotificationPreferenceController,
  getAllNotificationPreferencesController,
} from "../controllers/notificationPreference.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";
import { requireAdmin } from "../middleware/authorization.js";

const notificationPreferenceRouter = Router();

/**
 * USER NOTIFICATION PREFERENCES (Authenticated Users)
 */

// Create notification preference for authenticated user
notificationPreferenceRouter.post(
  "/",
  requireApiAuth,
  createNotificationPreferenceController
);

// Get my notification preference
notificationPreferenceRouter.get(
  "/me",
  requireApiAuth,
  getMyNotificationPreferenceController
);

// Update my notification preference
notificationPreferenceRouter.patch(
  "/me",
  requireApiAuth,
  updateMyNotificationPreferenceController
);

// Delete my notification preference
notificationPreferenceRouter.delete(
  "/me",
  requireApiAuth,
  deleteMyNotificationPreferenceController
);

/**
 * ADMIN NOTIFICATION PREFERENCES
 */

// Get all notification preferences (admin only)
notificationPreferenceRouter.get(
  "/",
  requireApiAuth,
  requireAdmin,
  getAllNotificationPreferencesController
);

// Get notification preference by ID (admin only)
notificationPreferenceRouter.get(
  "/:id",
  requireApiAuth,
  requireAdmin,
  getNotificationPreferenceByIdController
);

export default notificationPreferenceRouter;
