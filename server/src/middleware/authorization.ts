import type { Request, Response, NextFunction } from "express";
import { UserType } from "@prisma/client";
import db from "../../config/prisma.js";

/**
 * Middleware to check user role
 * @param role - The required role: 'admin' or 'user'
 */
export const requireRole = (role: "admin" | "user") => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      // Check if user is authenticated (should be verified by requireApiAuth already)
      if (!user || !user.id) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "No valid user session found. Please authenticate first."
        });
      }

      // Fetch user from database to check role
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { id: true, userType: true, email: true },
      });

      // Check if user exists in database
      if (!dbUser) {
        console.warn(`User with ID ${user.id} not found in database`);
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "User account no longer exists or has been deleted."
        });
      }

      // Check if user has required role
      if (dbUser.userType !== role) {
        console.warn(
          `Access denied: User ${dbUser.email} (${dbUser.id}) has role '${dbUser.userType}', required '${role}'`
        );
        return res.status(403).json({ 
          error: "Forbidden",
          message: `Access denied. Your account has '${dbUser.userType}' role, but this endpoint requires '${role}' role.`,
          userRole: dbUser.userType,
          requiredRole: role
        });
      }

      // Attach user data to request for downstream handlers
      (req as any).dbUser = dbUser;
      next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      return res.status(500).json({ 
        error: "Internal server error",
        message: "An unexpected error occurred during authorization. Please try again later."
      });
    }
  };

/**
 * Alias middleware for requiring admin role
 */
export const requireAdmin = requireRole("admin");

/**
 * Middleware to check if user is either admin or regular user (always passes if authenticated)
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "No valid user session found. Please authenticate first."
      });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, userType: true, email: true },
    });

    if (!dbUser) {
      console.warn(`User with ID ${user.id} not found in database`);
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User account no longer exists or has been deleted."
      });
    }

    // Verify user is either admin or user (validation check)
    if (!["admin", "user"].includes(dbUser.userType)) {
      console.error(`Invalid user type '${dbUser.userType}' for user ${dbUser.email}`);
      return res.status(403).json({ 
        error: "Forbidden",
        message: `User account has invalid role '${dbUser.userType}'. Contact support.`,
        userRole: dbUser.userType
      });
    }

    (req as any).dbUser = dbUser;
    next();
  } catch (error) {
    console.error("Authorization middleware error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: "An unexpected error occurred during authorization. Please try again later."
    });
  }
};
