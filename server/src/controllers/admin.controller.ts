import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  promoteToAdmin,
  demoteAdmin,
} from "../services/admin.js";
import { emailService } from "../services/email.js";
import db from "../../config/prisma.js";

/**
 * ADMIN CONTROLLER
 * 
 * AUTHORIZATION RULES:
 * - CREATE: Only super admin
 * - READ: Super admin and admin
 * - UPDATE: Only super admin
 * - DELETE: Super admin and admin (but not themselves)
 * - PROMOTE: Only super admin
 * - DEMOTE: Only super admin (but not themselves)
 */

const getErrorPayload = (error: unknown) => {
  const err = error as
    | { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
    | undefined;

  return {
    statusCode: err?.statusCode ?? 500,
    message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
  };
};

/**
 * Create a new admin
 * POST /api/admins
 * Only super admin
 * 
 * Request body:
 * {
 *   email: "admin@example.com",
 *   password: "SecurePassword123!",
 *   phone?: "+1234567890",
 *   name?: "Admin Name",
 *   firstName?: "Admin",
 *   lastName?: "User"
 * }
 */
export const createAdminController = async (req: Request, res: Response) => {
  try {
    const { email, password, phone, name, firstName, lastName } = req.body;
    const requester = (req as any).user;

    // Validate input
    if (!email) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Email is required",
      });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Password must be at least 8 characters",
      });
    }

    // Create admin using user registration system
    const newAdmin = await createAdmin({
      email,
      password,
      phone,
      name,
      firstName,
      lastName,
    });

    // Generate email verification token (same as user registration)
    const verificationToken = randomBytes(32).toString("hex");
    const frontendURL = "https://landstore.my";
    const verificationURL = `${frontendURL}/verify-email-callback?token=${verificationToken}`;

    // Store verification token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await db.verification.create({
      data: {
        identifier: `email_verification_${email.toLowerCase()}`,
        value: verificationToken,
        token: verificationToken,
        expiresAt: expiresAt,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(email.toLowerCase(), verificationToken, verificationURL);

    return res.status(201).json({
      message: "Admin created successfully. Please check your email to verify your account.",
      admin: {
        id: newAdmin.userId,
        email: email.toLowerCase(),
        name: name || `${firstName || ""} ${lastName || ""}`.trim() || email,
        phone: phone || null,
        role: newAdmin.adminRole,
        emailVerified: false,
        createdAt: new Date()
      },
    });
  } catch (error) {
    const payload = getErrorPayload(error);
    return res.status(payload.statusCode).json({
      error: payload.statusCode === 409 ? "Conflict" : "Internal server error",
      message: payload.message,
    });
  }
};

/**
 * Get all admins
 * GET /api/admins
 * Super admin and admin
 * 
 * Query params:
 * - status?: "active" | "inactive" | "suspended"
 * - search?: string (searches email and name)
 */
export const getAllAdminsController = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const requester = (req as any).user;

    // Fetch all admins
    let searchValue: string | undefined = undefined;
    if (typeof search === "string") {
      searchValue = search;
    } else if (Array.isArray(search) && search.length > 0 && typeof search[0] === "string") {
      searchValue = search[0];
    }
    
    const admins = await getAllAdmins({
      status: (Array.isArray(status) ? status[0] : status) as "active" | "inactive" | "suspended" | undefined,
      search: searchValue,
    });

    return res.status(200).json({
      message: "Admins retrieved successfully",
      count: admins.length,
      admins,
    });
  } catch (error) {
    const payload = getErrorPayload(error);
    return res.status(payload.statusCode).json({
      error: "Internal server error",
      message: payload.message,
    });
  }
};

/**
 * Get admin by ID
 * GET /api/admins/:adminId
 * Super admin and admin
 */
export const getAdminByIdController = async (req: Request, res: Response) => {
  try {
    const adminId = Array.isArray(req.params.adminId) ? req.params.adminId[0] : req.params.adminId;

    if (!adminId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Admin ID is required",
      });
    }

    const admin = await getAdminById(adminId);

    return res.status(200).json({
      message: "Admin retrieved successfully",
      admin,
    });
  } catch (error) {
    const payload = getErrorPayload(error);
    const statusCode = (error as any)?.statusCode || 500;
    return res.status(statusCode).json({
      error: statusCode === 404 ? "Not Found" : "Internal server error",
      message: payload.message,
    });
  }
};

/**
 * Update admin details
 * PATCH /api/admins/:adminId
 * Only super admin
 * 
 * Request body:
 * {
 *   email?: "newemail@example.com",
 *   phone?: "+1234567890",
 *   name?: "New Name",
 *   status?: "active" | "inactive" | "suspended"
 * }
 */
export const updateAdminController = async (req: Request, res: Response) => {
  try {
    const adminId = Array.isArray(req.params.adminId) ? req.params.adminId[0] : req.params.adminId;
    const { email, phone, name, status } = req.body;
    const requester = (req as any).user;

    if (!adminId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Admin ID is required",
      });
    }

    const updatedAdmin = await updateAdmin(
      adminId,
      { email, phone, name, status },
      requester.id,
    );

    return res.status(200).json({
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    const payload = getErrorPayload(error);
    const statusCode = (error as any)?.statusCode || 500;
    return res.status(statusCode).json({
      error: statusCode === 403 ? "Forbidden" : statusCode === 404 ? "Not Found" : "Internal server error",
      message: payload.message,
    });
  }
};

/**
 * Delete admin
 * DELETE /api/admins/:adminId
 * Super admin and admin (but not themselves)
 * 
 * Rules:
 * - Admin and super admin can delete
 * - Cannot delete themselves
 */
export const deleteAdminController = async (req: Request, res: Response) => {
  try {
    const adminId = Array.isArray(req.params.adminId) ? req.params.adminId[0] : req.params.adminId;
    const requester = (req as any).user;

    if (!adminId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Admin ID is required",
      });
    }

    const result = await deleteAdmin(adminId, requester.id);

    return res.status(200).json(result);
  } catch (error) {
    const payload = getErrorPayload(error);
    const statusCode = (error as any)?.statusCode || 500;
    return res.status(statusCode).json({
      error: statusCode === 403 ? "Forbidden" : statusCode === 404 ? "Not Found" : "Internal server error",
      message: payload.message,
    });
  }
};

/**
 * Promote user to admin
 * POST /api/admins/:userId/promote
 * Only super admin
 * 
 * Converts a regular user to admin
 */
export const promoteToAdminController = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const requester = (req as any).user;

    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "User ID is required",
      });
    }

    const result = await promoteToAdmin(userId, requester.id);

    return res.status(200).json(result);
  } catch (error) {
    const payload = getErrorPayload(error);
    const statusCode = (error as any)?.statusCode || 500;
    return res.status(statusCode).json({
      error: statusCode === 403 ? "Forbidden" : statusCode === 404 ? "Not Found" : "Internal server error",
      message: payload.message,
    });
  }
};

/**
 * Demote admin to user
 * POST /api/admins/:adminId/demote
 * Only super admin (and not themselves)
 * 
 * Converts an admin back to regular user
 */
export const demoteAdminController = async (req: Request, res: Response) => {
  try {
    const adminId = Array.isArray(req.params.adminId) ? req.params.adminId[0] : req.params.adminId;
    const requester = (req as any).user;

    if (!adminId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Admin ID is required",
      });
    }

    const result = await demoteAdmin(adminId, requester.id);

    return res.status(200).json(result);
  } catch (error) {
    const payload = getErrorPayload(error);
    const statusCode = (error as any)?.statusCode || 500;
    return res.status(statusCode).json({
      error: statusCode === 403 ? "Forbidden" : statusCode === 404 ? "Not Found" : "Internal server error",
      message: payload.message,
    });
  }
};
