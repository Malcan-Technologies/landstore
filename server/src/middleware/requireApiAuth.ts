import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

const requireApiAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Try Authorization Bearer header first
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // 2. Fall back to __session cookie (cookie-based flow)
    const cookieToken = (req.cookies as Record<string, string>)?.["__session"];

    const token = bearerToken ?? cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default requireApiAuth;
