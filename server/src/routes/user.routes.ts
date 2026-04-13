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

const userRouter = Router();

// Register and complete profile in one step (combined endpoint)
userRouter.post("/register-complete", registerAndCompleteProfileController);

// Complete profile after Better Auth signup (keep for backward compatibility)
// userRouter.post("/complete-profile", completeProfileController);

// Get current authenticated user (requires auth)
userRouter.get("/me", requireApiAuth, getCurrentUserController);

// Get complete user profile with all registration data (requires auth)
userRouter.get("/profile", requireApiAuth, getUserCompleteProfileController);

// User management (admin only)
userRouter.get("/", requireApiAuth, getAllUsersController);
userRouter.get("/:id", requireApiAuth, getUserByIdController);
userRouter.patch("/:id", requireApiAuth, updateUserController);
userRouter.delete("/:id", requireApiAuth, deleteUserController);

export default userRouter;
