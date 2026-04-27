import db from "../../config/prisma.js";
import { signUpAndCompleteProfile } from "./user.js";

type AdminRole = "admin" | "superadmin";
const prismaAny = db as any;

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
 * Create a new admin using the same registration system as users
 * Only super admin can create admins
 * 
 * @param adminData - Admin registration data with password
 * @throws Error if user already exists or invalid data
 */
export const createAdmin = async (adminData: {
  email: string;
  password: string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}) => {
  const { email, password, phone, name, firstName, lastName } = adminData;

  // Use the existing user registration system
  const registrationResult = await signUpAndCompleteProfile(email, password, {
    phone,
    name,
    firstName,
    lastName,
  });

  // Create admin record for the new user
  const adminRecord = await prismaAny.admin.create({
    data: {
      userId: registrationResult.userId,
      role: "admin",
    },
  });

  return {
    ...registrationResult,
    adminRole: adminRecord.role,
  };
};

/**
 * Get all admins
 * Super admin and admin can view all admins
 */
export const getAllAdmins = async (filters?: {
  status?: "active" | "inactive" | "suspended" | undefined;
  search?: string | undefined;
}) => {
  const where: any = {};

  if (filters?.status) {
    where.user = { ...(where.user ?? {}), status: filters.status };
  }

  if (filters?.search) {
    where.user = {
      ...(where.user ?? {}),
      OR: [
        { email: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  const admins = await prismaAny.admin.findMany({
    where,
    select: {
      role: true,
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
        },
      },
    },
    orderBy: {
      user: {
        createdAt: "desc",
      },
    },
  });

  return admins.map((admin: any) => ({
    ...admin.user,
  }));
};

/**
 * Get admin by ID
 */
export const getAdminById = async (adminId: string) => {
  const admin = await prismaAny.admin.findUnique({
    where: { userId: adminId },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          image: true,
        },
      },
    },
  });

  if (!admin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return {
    ...admin.user,
  };
};

const getRequesterAdminRole = async (requesterId: string): Promise<AdminRole | null> => {
  const requesterAdmin = await prismaAny.admin.findUnique({
    where: { userId: requesterId },
    select: { role: true },
  });

  return requesterAdmin?.role ?? null;
};

/**
 * Update admin details
 * Both super admin and admin can update other admins
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
  const requesterRole = await getRequesterAdminRole(requesterId);

  // Get target admin
  const targetAdmin = await prismaAny.admin.findUnique({
    where: { userId: adminId },
    select: { role: true, userId: true },
  });

  if (!targetAdmin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Check authorization: only super admin can update
  if (requesterRole !== "superadmin") {
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
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
    },
  });

  return {
    ...updatedAdmin,
  };
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
  const requesterRole = await getRequesterAdminRole(requesterId);
  // Prevent self-deletion
  if (adminId === requesterId) {
    const error = new Error("You cannot delete your own admin account");
    (error as any).statusCode = 403;
    throw error;
  }

  // Get target admin
  const targetAdmin = await prismaAny.admin.findUnique({
    where: { userId: adminId },
    select: { role: true, user: { select: { id: true, email: true, name: true } } },
  });

  if (!targetAdmin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Check authorization
  // Only super admin and admin can delete admins
  if (requesterRole !== "superadmin" && requesterRole !== "admin") {
    const error = new Error("Only super admin or admin can delete admin accounts");
    (error as any).statusCode = 403;
    throw error;
  }

  if (requesterRole === "admin" && targetAdmin.role === "superadmin") {
    const error = new Error("Admins cannot delete super admin accounts");
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
    },
  });

  return {
    message: "Admin account deleted successfully",
    deletedAdmin: {
      ...deletedAdmin,
    },
  };
};

/**
 * Promote user to admin
 * Only super admin can promote users to admin
 */
export const promoteToAdmin = async (
  userId: string,
  requesterId: string
) => {
  const requesterRole = await getRequesterAdminRole(requesterId);

  // Check authorization
  if (requesterRole !== "superadmin") {
    const error = new Error("Only super admin can promote users to admin");
    (error as any).statusCode = 403;
    throw error;
  }

  // Get user
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const existingAdmin = await prismaAny.admin.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });

  if (existingAdmin) {
    const error = new Error("User is already an admin");
    (error as any).statusCode = 400;
    throw error;
  }

  // Promote to admin
  const promotedUser = await db.$transaction(async (trx) => {
    await (trx as any).admin.create({
      data: {
        userId,
        role: "admin",
      },
    });

    return trx.user.update({
      where: { id: userId },
      data: {},
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  return {
    message: "User promoted to admin successfully",
    user: {
      ...promotedUser,
    },
  };
};

/**
 * Demote admin to regular user
 * Only super admin can demote admins
 * Admin cannot demote themselves
 */
export const demoteAdmin = async (
  adminId: string,
  requesterId: string
) => {
  const requesterRole = await getRequesterAdminRole(requesterId);

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
  const admin = await prismaAny.admin.findUnique({
    where: { userId: adminId },
    select: { role: true, userId: true },
  });

  if (!admin) {
    const error = new Error("Admin not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (admin.role === "superadmin") {
    const error = new Error("Super admin cannot be demoted through this endpoint");
    (error as any).statusCode = 400;
    throw error;
  }

  // Demote to regular user
  const demotedUser = await db.$transaction(async (trx) => {
    await (trx as any).admin.delete({
      where: { userId: adminId },
    });

    return trx.user.update({
      where: { id: adminId },
      data: {},
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  return {
    message: "Admin demoted to user successfully",
    user: {
      ...demotedUser,
    },
  };
};
