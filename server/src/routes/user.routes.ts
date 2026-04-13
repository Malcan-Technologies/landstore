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
} from "../controllers/user.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";
import { requireAdmin } from "../middleware/authorization.js";

const userRouter = Router();

/**
 * REGISTRATION:
 * POST /api/users/register
 * Body: { email, password, name, phone, userType, profileType, ... }
 * Response: Full user profile with hashed password in Account table
 */
userRouter.post("/register", registerAndCompleteProfileController);

// Get current authenticated user (requires auth)
userRouter.get("/me", requireApiAuth, getCurrentUserController);

// Get complete user profile with all registration data (requires auth)
userRouter.get("/profile", requireApiAuth, getUserCompleteProfileController);

// User management (admin only)
userRouter.get("/", requireApiAuth, requireAdmin,getAllUsersController);
userRouter.get("/:id", requireApiAuth, getUserByIdController);
userRouter.patch("/:id", requireApiAuth, updateUserController);
userRouter.delete("/:id", requireApiAuth, deleteUserController);

export default userRouter;
