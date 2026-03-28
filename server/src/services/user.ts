import db from "../../config/prisma.ts";
import { Prisma } from "@prisma/client";
import type { User, UserType } from "@prisma/client";
import { auth } from "../../config/auth.ts";

type UpdateUserPayload = {
  email?: string;
  phone?: string | null;
  userType?: UserType;
};

type CreateUserProfilePayload = {
  email: string;
  userType?: UserType;
  phone?: string;
  profileType?: "individual" | "company" | "koperasi";
  fullName?: string;
  identityNo?: string;
  companyName?: string;
  koperasiName?: string;
  registrationNo?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizePhone = (phone?: string | null) => {
  const value = phone?.trim();
  return value ? value : null;
};

const isValidUserType = (value?: string): value is UserType => {
  return value === "admin" || value === "user";
};

const buildDisplayName = (
  firstName?: string,
  lastName?: string,
  name?: string
): string | null => {
  if (name?.trim()) return name.trim();
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || null;
};

/**
 * Validate Better Auth session token and retrieve user
 * Supports both session cookies and bearer tokens
 */
export const getRequesterUserFromToken = async (token: string): Promise<User> => {
  try {
    // Validate session with Better Auth
    const session = await auth.api.getSession({
      headers: {
        cookie: `__session=${token}`,
      },
    });

    if (!session?.user?.id) {
      const unauthorizedError = new Error("Invalid or expired session");
      (unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
      throw unauthorizedError;
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      const notFoundError = new Error("User not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    return user;
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;
    
    const unauthorizedError = new Error("Invalid or expired session");
    (unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
    throw unauthorizedError;
  }
};

// Update user profile after Better Auth signup
// Better Auth has already created the User record
export const completeUserProfile = async ({
  email,
  userType,
  phone,
  profileType,
  fullName,
  identityNo,
  companyName,
  koperasiName,
  registrationNo,
  firstName,
  lastName,
  name,
}: CreateUserProfilePayload) => {
  const normalizedEmail = normalizeEmail(email);

  // Find user created by Better Auth
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const notFoundError = new Error("User not found. Please sign up first.");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  // Update user with business fields
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      phone: normalizePhone(phone),
      userType: userType ?? "user",
    },
  });

  // Create user profile details
  await upsertUserProfileDetail(user.id, {
    email,
    userType,
    phone,
    profileType,
    fullName,
    identityNo,
    companyName,
    koperasiName,
    registrationNo,
    firstName,
    lastName,
    name,
  });

  return updatedUser;
};

const upsertUserProfileDetail = async (
  userId: string,
  payload: CreateUserProfilePayload
) => {
  const profileType =
    payload.profileType ??
    (payload.companyName ? "company" : payload.koperasiName ? "koperasi" : "individual");

  if (profileType === "individual") {
    const fullName = payload.fullName ?? buildDisplayName(payload.firstName, payload.lastName, payload.name);

    if (!fullName) {
      const badRequestError = new Error("fullName is required for individual profile");
      (badRequestError as Error & { statusCode?: number }).statusCode = 400;
      throw badRequestError;
    }

    await db.individual.upsert({
      where: { userId },
      update: {
        fullName,
        identityNo: payload.identityNo ?? null,
      },
      create: {
        userId,
        fullName,
        identityNo: payload.identityNo ?? null,
      },
    });
    return;
  }

  if (profileType === "company") {
    const companyName = payload.companyName ?? payload.name?.trim();

    if (!companyName) {
      const badRequestError = new Error("companyName is required for company profile");
      (badRequestError as Error & { statusCode?: number }).statusCode = 400;
      throw badRequestError;
    }

    await db.company.upsert({
      where: { userId },
      update: {
        companyName,
        registrationNo: payload.registrationNo ?? null,
      },
      create: {
        userId,
        companyName,
        registrationNo: payload.registrationNo ?? null,
      },
    });
    return;
  }

  const koperasiName = payload.koperasiName ?? payload.name?.trim();

  if (!koperasiName) {
    const badRequestError = new Error("koperasiName is required for koperasi profile");
    (badRequestError as Error & { statusCode?: number }).statusCode = 400;
    throw badRequestError;
  }

  await db.koperasi.upsert({
    where: { userId },
    update: {
      koperasiName,
      registrationNo: payload.registrationNo ?? null,
    },
    create: {
      userId,
      koperasiName,
      registrationNo: payload.registrationNo ?? null,
    },
  });
};

export const getUserById = async (id: string) => {
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) {
    const notFoundError = new Error("User not found");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  return user;
};

export const getUserByEmail = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await db.user.findFirst({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const notFoundError = new Error("User not found");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  return user;
};

export const getAllUsers = async () => {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const updateUserById = async (id: string, payload: UpdateUserPayload) => {
  const updateData: { email?: string; phone?: string | null; userType?: UserType } = {};

  if (payload.email !== undefined) {
    updateData.email = normalizeEmail(payload.email);
  }

  if (payload.phone !== undefined) {
    updateData.phone = normalizePhone(payload.phone);
  }

  if (payload.userType !== undefined) {
    if (!isValidUserType(payload.userType)) {
      const badRequestError = new Error("Invalid userType");
      (badRequestError as Error & { statusCode?: number }).statusCode = 400;
      throw badRequestError;
    }
    updateData.userType = payload.userType;
  }

  if (Object.keys(updateData).length === 0) {
    const badRequestError = new Error("No valid fields provided for update");
    (badRequestError as Error & { statusCode?: number }).statusCode = 400;
    throw badRequestError;
  }

  try {
    return await db.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      const notFoundError = new Error("User not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const conflictError = new Error("Email already exists");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
};

export const deleteUserById = async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    const notFoundError = new Error("User not found");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  try {
    await db.$transaction([
      db.individual.deleteMany({ where: { userId: id } }),
      db.company.deleteMany({ where: { userId: id } }),
      db.koperasi.deleteMany({ where: { userId: id } }),
      db.user.delete({ where: { id } }),
    ]);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      const conflictError = new Error("Cannot delete user due to related records");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    throw error;
  }

  return { message: "User deleted successfully" };
};
