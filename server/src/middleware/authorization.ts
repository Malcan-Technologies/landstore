import type { Request, Response, NextFunction } from "express";
import db from "../../config/prisma.js";

const prismaAny = db as any;

/**
 * Middleware to check user role
 * @param role - The required role: 'admin' or 'user' or 'superadmin'
 */
export const requireRole = (role: "superadmin" | "admin" | "user") => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      // Check if user is authenticated (should be verified by requireApiAuth already)
      if (!user || !user.id) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Authentication required. Valid user session not found. Please log in again."
        });
      }

      // Fetch user from database to check role
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true },
      });
      // Check if user exists in database
      if (!dbUser) {
        console.warn(`User with ID ${user.id} not found in database`);
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "User account not found. Your account may have been deleted or suspended."
        });
      }

      const adminRecord = await prismaAny.admin.findUnique({
        where: { userId: dbUser.id },
        select: { role: true },
      });
      const userRole = adminRecord?.role ?? "user";
      const requiredRole = role;

      // Superadmin is a universal override for all role-gated routes.
      if (userRole !== requiredRole && userRole !== "superadmin") {
        console.warn(
          `Access denied: User ${dbUser.email} (${dbUser.id}) has role '${userRole}', required '${role}'`
        );
        return res.status(403).json({ 
          error: "Forbidden",
          message: `Access denied. This resource requires '${role}' permissions, but your account is configured as '${userRole}'. Contact an administrator if you need access level changes.`,
          userRole,
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
export const requireSuperAdmin = requireRole("superadmin");

/**
 * Middleware to check if user is either admin or super admin
 * Used for operations where both admin and super admin can perform actions
 */
export const requireAdminOrSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required. Valid user session not found. Please log in again.",
      });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true },
    });

    if (!dbUser) {
      console.warn(`User with ID ${user.id} not found in database`);
      return res.status(401).json({
        error: "Unauthorized",
        message: "User account not found. Your account may have been deleted or suspended.",
      });
    }

    const adminRecord = await prismaAny.admin.findUnique({
      where: { userId: dbUser.id },
      select: { role: true },
    });
    const userRole = adminRecord?.role ?? "user";

    // Check if user is admin or superadmin
    if (userRole !== "admin" && userRole !== "superadmin") {
      console.warn(
        `Access denied: User ${dbUser.email} (${dbUser.id}) must be admin or superadmin, but is '${userRole}'`
      );
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied. This resource requires 'admin' or 'superadmin' permissions.",
        userRole,
      });
    }

    (req as any).dbUser = dbUser;
    next();
  } catch (error) {
    console.error("Authorization middleware error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred during authorization. Please try again later.",
    });
  }
};

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
        message: "Authentication required. Valid user session not found. Please log in again."
      });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true },
    });

    if (!dbUser) {
      console.warn(`User with ID ${user.id} not found in database`);
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User account not found. Your account may have been deleted or suspended."
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
