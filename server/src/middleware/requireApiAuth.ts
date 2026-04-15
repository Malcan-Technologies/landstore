import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../config/auth.js";

const requireApiAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get session from Better Auth using proper header format
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "Authentication required. Please log in to access this resource." 
      });
    }

    // Attach user and session to request
    (req as any).user = session.user;
    (req as any).session = session.session;
    return next();
  } catch (error) {
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "Invalid or expired authentication credentials. Please log in again." 
    });
  }
};

export default requireApiAuth;
