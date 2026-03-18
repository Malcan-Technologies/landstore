import { Router } from "express";
import {
  getCurrentUserController,
  loginController,
  logoutController,
  signUpController,
} from "../controllers/user.controller.ts";
import requireApiAuth from "../middleware/requireApiAuth.ts";

const userRouter = Router();

userRouter.post("/signup", signUpController);
userRouter.post("/login", loginController);
userRouter.get("/me", requireApiAuth, getCurrentUserController);
userRouter.post("/logout", requireApiAuth, logoutController);

export default userRouter;
