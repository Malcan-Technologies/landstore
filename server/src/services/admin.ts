import db from "../../config/prisma.js";
import type { User, UserType } from "@prisma/client";

/**
 * ADMIN SERVICE
 * 
 * ADMIN MANAGEMENT RULES:
 * 1. Only SUPER_ADMIN can CREATE admins
 * 2. Both SUPER_ADMIN and ADMIN can DELETE admins (with restrictions)
 * 3. An admin or super admin CANNOT delete themselves
 * 4. Can update admin details (email, phone, status)
 */

/**
 * Create a new admin
 * Only super admin can create admins
 * 
 * @param adminData - Admin profile data
 * @throws Error if user already exists or invalid data
 */
export const createAdmin = async (adminData: {
  email: string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}) => {
  const normalizedEmail = adminData.email.trim().toLowerCase();

  // Check if admin with this email already exists
  const existingAdmin = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingAdmin) {
    const error = new Error("Admin with this email already exists");
    (error as any).statusCode = 409;
    throw error;
  }

  // Create admin user
  const displayName =
    adminData.name ||
    `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim() ||
    normalizedEmail;

  const admin = await db.user.create({
    data: {
      email: normalizedEmail,
      phone: adminData.phone?.trim() || null,
      name: displayName,
      userType: "admin",
      status: "active",
      emailVerified: false,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      userType: true,
      status: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  return admin;
};

/**
 * Get all admins
 * Super admin and admin can view all admins
 */
export const getAllAdmins = async (filters?: {
  status?: "active" | "inactive" | "suspended" | undefined;
  search?: string | undefined;
}) => {
  const where: any = {
    userType: "admin",
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { email: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const admins = await db.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      userType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return admins;
};

/**
 * Get admin by ID
 */
export const getAdminById = async (adminId: string) => {
  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      userType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
      image: true,
    },
  });

  if (!admin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (admin.userType !== "admin") {
    const error = new Error("User is not an admin");
    (error as any).statusCode = 400;
    throw error;
  }

  return admin;
};

/**
 * Update admin details
 * Both super admin and admin can update other admins
 * Cannot update their own userType
 */
export const updateAdmin = async (
  adminId: string,
  updateData: {
    email?: string;
    phone?: string;
    name?: string;
    status?: "active" | "inactive" | "suspended";
  },
  requesterId: string,
) => {
  // Get super admin
  const superAdmin = await db.user.findUnique({
    where: { id: requesterId },
    select: { id: true, userType: true, email: true },
  })
  // Get target admin
  const targetAdmin = await db.user.findUnique({
    where: { id: adminId },
    select: { id: true, userType: true, email: true },
  });

  if (!targetAdmin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (targetAdmin.userType !== "admin") {
    const error = new Error("Target user is not an admin");
    (error as any).statusCode = 400;
    throw error;
  }

  // Check authorization: only super admin can update
  if (superAdmin?.userType !== "superadmin") {
    const error = new Error("Only super admin can update admin details");
    (error as any).statusCode = 403;
    throw error;
  }

  // Prepare update data
  const dataToUpdate: any = {};
  if (updateData.email) {
    dataToUpdate.email = updateData.email.trim().toLowerCase();
  }
  if (updateData.phone !== undefined) {
    dataToUpdate.phone = updateData.phone?.trim() || null;
  }
  if (updateData.name) {
    dataToUpdate.name = updateData.name.trim();
  }
  if (updateData.status) {
    dataToUpdate.status = updateData.status;
  }

  const updatedAdmin = await db.user.update({
    where: { id: adminId },
    data: dataToUpdate,
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      userType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
    },
  });

  return updatedAdmin;
};

/**
 * Delete admin
 * Rules:
 * - Only SUPER_ADMIN can create admins, but both SUPER_ADMIN and ADMIN can delete
 * - An admin or super admin CANNOT delete themselves
 * - Cannot delete if user is not an admin
 */
export const deleteAdmin = async (
  adminId: string,
  requesterId: string
) => {
  // Get super admin
  const superAdmin = await db.user.findUnique({
    where: { id: requesterId },
    select: { id: true, userType: true, email: true },
  })
  // Prevent self-deletion
  if (adminId === requesterId) {
    const error = new Error("You cannot delete your own admin account");
    (error as any).statusCode = 403;
    throw error;
  }

  // Get target admin
  const targetAdmin = await db.user.findUnique({
    where: { id: adminId },
    select: { id: true, userType: true, email: true },
  });

  if (!targetAdmin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (targetAdmin.userType !== "admin") {
    const error = new Error("Target user is not an admin");
    (error as any).statusCode = 400;
    throw error;
  }

  // Check authorization
  // Only super admin and admin can delete admins
  if (superAdmin?.userType !== "superadmin" ) {
    const error = new Error("Only super admin or admin can delete admin accounts");
    (error as any).statusCode = 403;
    throw error;
  }

  // Delete the admin user (cascade delete will handle related records)
  const deletedAdmin = await db.user.delete({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
    },
  });

  return {
    message: "Admin account deleted successfully",
    deletedAdmin,
  };
};

/**
 * Promote user to admin
 * Only super admin can promote users to admin
 */
export const promoteToAdmin = async (
  userId: string,
  requesterId: string,
  requesterRole: UserType
) => {
  // Check authorization
  if (requesterRole !== "superadmin") {
    const error = new Error("Only super admin can promote users to admin");
    (error as any).statusCode = 403;
    throw error;
  }

  // Get user
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, userType: true, email: true },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (user.userType === "admin") {
    const error = new Error("User is already an admin");
    (error as any).statusCode = 400;
    throw error;
  }

  // Promote to admin
  const promotedUser = await db.user.update({
    where: { id: userId },
    data: { userType: "admin" },
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    message: "User promoted to admin successfully",
    user: promotedUser,
  };
};

/**
 * Demote admin to regular user
 * Only super admin can demote admins
 * Admin cannot demote themselves
 */
export const demoteAdmin = async (
  adminId: string,
  requesterId: string,
  requesterRole: UserType
) => {
  // Prevent self-demotion
  if (adminId === requesterId) {
    const error = new Error("You cannot demote yourself");
    (error as any).statusCode = 403;
    throw error;
  }

  // Check authorization
  if (requesterRole !== "superadmin") {
    const error = new Error("Only super admin can demote admins");
    (error as any).statusCode = 403;
    throw error;
  }

  // Get admin
  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: { id: true, userType: true, email: true },
  });

  if (!admin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (admin.userType !== "admin") {
    const error = new Error("User is not an admin");
    (error as any).statusCode = 400;
    throw error;
  }

  // Demote to regular user
  const demotedUser = await db.user.update({
    where: { id: adminId },
    data: { userType: "user" },
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    message: "Admin demoted to user successfully",
    user: demotedUser,
  };
};
