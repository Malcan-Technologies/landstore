import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../config/auth.js";

const optionalApiAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get session from Better Auth using proper header format
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session && session.user) {
      // Attach user and session to request if authenticated
      (req as any).user = session.user;
      (req as any).session = session.session;
    }
    // Continue regardless of authentication status
    return next();
  } catch (error) {
    // Allow request to proceed even if session retrieval fails
    return next();
  }
};

export default optionalApiAuth;
