import { Router } from "express";
import {
  completeProfileController,
  deleteUserController,
  getAllUsersController,
  getCurrentUserController,
  getUserByIdController,
  updateUserController,
  getUserCompleteProfileController,
  registerAndCompleteProfileController,
  requestPasswordResetController,
  resetPasswordCallbackController,
  resetPasswordController,
  verifyEmailCallbackController,
  verifyEmailController,
  getMyProfileController,
  loginController,
  getUserGrowthController,
  getUserBreakdownController,
  getUserStatisticsController
} from "../controllers/user.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";
import { requireAdmin } from "../middleware/authorization.js";
import multer from "multer";

const userRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * REGISTRATION:
 * POST /api/users/register
 * Body: { email, password, name, phone, profileType, ... }
 * Response: Full user profile with verification email sent
 */
userRouter.post("/register", upload.single("profileImage"), registerAndCompleteProfileController);
userRouter.post("/login", loginController);

/**
 * EMAIL VERIFICATION ENDPOINTS (No auth required):
 * GET /api/users/verify-email-callback - Handle email link click
 * POST /api/users/verify-email - Confirm email verification with token
 */
userRouter.get("/verify-email-callback", verifyEmailCallbackController);
userRouter.post("/verify-email", verifyEmailController);

/**
 * PASSWORD RESET ENDPOINTS (No auth required):
 * POST /api/users/forgot-password - Request password reset link
 * POST /api/users/reset-password - Reset password with token
 */
userRouter.post("/forgot-password", requestPasswordResetController);
userRouter.post("/reset-password", resetPasswordController);

// Get current authenticated user (requires auth)
userRouter.get("/me", requireApiAuth, getCurrentUserController);

// Get my complete profile using authenticated user ID (requires auth)
userRouter.get("/my-profile", requireApiAuth, getMyProfileController);

// Get complete user profile with all registration data (requires auth)
userRouter.get("/profile", requireApiAuth, getUserCompleteProfileController);

// User management (admin only)
userRouter.get("/", requireApiAuth, requireAdmin,getAllUsersController);

// Get user statistics (listings, shortlistings, enquiries counts)
userRouter.get("/statistics", requireApiAuth, getUserStatisticsController);

// Analytics - User growth over time (admin only)
userRouter.get("/analytics/growth", requireApiAuth, requireAdmin, getUserGrowthController);

// Analytics - User breakdown by entity type (admin only)
userRouter.get("/analytics/breakdown", requireApiAuth, requireAdmin, getUserBreakdownController);

// User by ID (must come after specific routes)
userRouter.get("/:id", requireApiAuth, getUserByIdController);
userRouter.patch("/me", requireApiAuth, upload.single("profileImage"), updateUserController);
userRouter.delete("/:id", requireApiAuth, deleteUserController);

export default userRouter;
