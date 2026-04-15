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
  loginController,
  getMyProfileController,
} from "../controllers/user.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";
import { requireAdmin } from "../middleware/authorization.js";

const userRouter = Router();

/**
 * AUTHENTICATION:
 * POST /api/users/login - Login with email and password
 * POST /api/users/register - Register and complete profile
 */
userRouter.post("/login", loginController);
userRouter.post("/register", registerAndCompleteProfileController);

// Get current authenticated user (requires auth)
userRouter.get("/me", requireApiAuth, getCurrentUserController);

// Get my complete profile using authenticated user ID (requires auth)
userRouter.get("/my-profile", requireApiAuth, getMyProfileController);

// Get complete user profile with all registration data (requires auth)
userRouter.get("/profile", requireApiAuth, getUserCompleteProfileController);

// User management (admin only)
userRouter.get("/", requireApiAuth, requireAdmin,getAllUsersController);
userRouter.get("/:id", requireApiAuth, getUserByIdController);
userRouter.patch("/:id", requireApiAuth, updateUserController);
userRouter.delete("/:id", requireApiAuth, deleteUserController);

export default userRouter;
