import { Router } from "express";
import {
  createAdminController,
  getAllAdminsController,
  getAdminByIdController,
  updateAdminController,
  deleteAdminController,
  promoteToAdminController,
  demoteAdminController,
} from "../controllers/admin.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";
import { requireSuperAdmin, requireAdminOrSuperAdmin } from "../middleware/authorization.js";

const adminRouter = Router();

/**
 * ADMIN MANAGEMENT ROUTES
 * 
 * AUTHENTICATION:
 * - Admins use the same auth routes as regular users
 * - Registration: POST /api/users/register (with admin role assigned during creation)
 * - Login: POST /api/users/login (same as users)
 * - Email Verification: GET/POST /api/users/verify-email (same as users)
 * 
 * ADMIN CREATION:
 * - POST /api/admins - Super admin creates admin account with password
 * - Admin receives verification email and verifies using user routes
 * - Admin then logs in using user login route
 * 
 * AUTHORIZATION RULES:
 * - CREATE: Only super admin → requireSuperAdmin
 * - READ (list/get): Super admin & admin → requireAdminOrSuperAdmin
 * - UPDATE: Only super admin → requireSuperAdmin
 * - DELETE: Super admin & admin → requireAdminOrSuperAdmin (self-delete blocked in service)
 * - PROMOTE: Only super admin → requireSuperAdmin
 * - DEMOTE: Only super admin → requireSuperAdmin (self-demote blocked in service)
 */

/**
 * CREATE ADMIN
 * POST /api/admins
 * Only super admin can create admins
 * 
 * Request body:
 * {
 *   email: "admin@example.com",
 *   phone?: "+1234567890",
 *   name?: "Admin Name",
 *   firstName?: "Admin",
 *   lastName?: "User"
 * }
 * 
 * Response:
 * {
 *   message: "Admin created successfully",
 *   admin: { id, email, phone, name, role, status, createdAt, emailVerified }
 * }
 */
adminRouter.post(
  "/",
  requireApiAuth,
  createAdminController
);

/**
 * GET ALL ADMINS
 * GET /api/admins
 * Super admin and admin can view all admins
 * 
 * Query params:
 * - status?: "active" | "inactive" | "suspended"
 * - search?: string (searches email and name)
 * 
 * Response:
 * {
 *   message: "Admins retrieved successfully",
 *   count: number,
 *   admins: []
 * }
 */
adminRouter.get(
  "/",
  requireApiAuth,
  requireAdminOrSuperAdmin,
  getAllAdminsController
);

/**
 * GET ADMIN BY ID
 * GET /api/admins/:adminId
 * Super admin and admin can view admin details
 * 
 * Response:
 * {
 *   message: "Admin retrieved successfully",
 *   admin: { id, email, phone, name, role, status, createdAt, updatedAt, emailVerified, image }
 * }
 */
adminRouter.get(
  "/:adminId",
  requireApiAuth,
  requireAdminOrSuperAdmin,
  getAdminByIdController
);

/**
 * UPDATE ADMIN
 * PATCH /api/admins/:adminId
 * Only super admin can update admins
 * 
 * Request body:
 * {
 *   email?: "newemail@example.com",
 *   phone?: "+1234567890",
 *   name?: "New Name",
 *   status?: "active" | "inactive" | "suspended"
 * }
 * 
 * Response:
 * {
 *   message: "Admin updated successfully",
 *   admin: { id, email, phone, name, role, status, createdAt, updatedAt, emailVerified }
 * }
 */
adminRouter.patch(
  "/:adminId",
  requireApiAuth,
  requireSuperAdmin,
  updateAdminController
);

/**
 * DELETE ADMIN
 * DELETE /api/admins/:adminId
 * Super admin and admin can delete admins
 * Rules:
 * - Cannot delete themselves
 * - Cannot delete if target is not an admin
 * 
 * Response:
 * {
 *   message: "Admin account deleted successfully",
 *   deletedAdmin: { id, email, name, role }
 * }
 */
adminRouter.delete(
  "/:adminId",
  requireApiAuth,
  requireAdminOrSuperAdmin,
  deleteAdminController
);

/**
 * PROMOTE USER TO ADMIN
 * POST /api/admins/:userId/promote
 * Only super admin can promote users to admin
 * 
 * Response:
 * {
 *   message: "User promoted to admin successfully",
 *   user: { id, email, name, role, status, createdAt, updatedAt }
 * }
 */
adminRouter.post(
  "/:userId/promote",
  requireApiAuth,
  requireSuperAdmin,
  promoteToAdminController
);

/**
 * DEMOTE ADMIN TO USER
 * POST /api/admins/:adminId/demote
 * Only super admin can demote admins
 * Rules:
 * - Cannot demote themselves
 * - Cannot demote if target is not an admin
 * 
 * Response:
 * {
 *   message: "Admin demoted to user successfully",
 *   user: { id, email, name, role, status, createdAt, updatedAt }
 * }
 */
adminRouter.post(
  "/:adminId/demote",
  requireApiAuth,
  requireSuperAdmin,
  demoteAdminController
);

export default adminRouter;
