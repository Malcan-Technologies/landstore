import { Router } from "express";
import {
  deleteUserController,
  getAllUsersController,
  getCurrentUserController,
  getUserByIdController,
  loginController,
  logoutController,
  refreshSessionController,
  signUpController,
  updateUserController,
} from "../controllers/user.controller.ts";
import requireApiAuth from "../middleware/requireApiAuth.ts";

const userRouter = Router();

userRouter.post("/signup", signUpController);
userRouter.post("/login", loginController);
userRouter.get("/me", requireApiAuth, getCurrentUserController);
userRouter.post("/logout", requireApiAuth, logoutController);
userRouter.post("/refresh", requireApiAuth, refreshSessionController);
userRouter.get("/", requireApiAuth, getAllUsersController);
userRouter.get("/:id", requireApiAuth, getUserByIdController);
userRouter.patch("/:id", requireApiAuth, updateUserController);
userRouter.delete("/:id", requireApiAuth, deleteUserController);

export default userRouter;
