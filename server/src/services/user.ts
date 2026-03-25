import { clerkClient } from "@clerk/express";
import db from "../../config/prisma.ts";
import { Prisma } from "@prisma/client";
import type { User, UserType } from "@prisma/client";

type SignUpPayload = {
  email: string;
  password: string;
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

type LoginPayload = {
  email: string;
  password: string;
};

type UpdateUserPayload = {
  email?: string;
  phone?: string | null;
  userType?: UserType;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const buildDisplayName = (
  firstName?: string,
  lastName?: string,
  name?: string
): string | null => {
  if (name?.trim()) return name.trim();
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || null;
};

const normalizePhone = (phone?: string | null) => {
  const value = phone?.trim();
  return value ? value : null;
};

const isValidUserType = (value?: string): value is UserType => {
  return value === "admin" || value === "user";
};

const findClerkUserByEmail = async (email: string) => {
  const result = await clerkClient.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });

  return result.data?.[0] ?? null;
};

const syncPostgresUser = async (params: {
  clerkId: string;
  email: string;
  phone?: string | null;
  userType?: UserType;
}) => {
  const { clerkId, email, phone, userType } = params;

  const updateData: {
    email: string;
    phone: string | null;
    userType?: UserType;
  } = {
    email: normalizeEmail(email),
    phone: normalizePhone(phone),
  };

  if (userType) updateData.userType = userType;

  return db.user.upsert({
    where: { clerkId },
    update: updateData,
    create: {
      clerkId,
      email: normalizeEmail(email),
      phone: normalizePhone(phone),
      userType: userType ?? "user",
    },
  });
};

const upsertUserProfileDetail = async (
  userId: string,
  payload: SignUpPayload
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

export const signUpUser = async ({
  email,
  password,
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
}: SignUpPayload) => {
  const normalizedEmail = normalizeEmail(email);

  if (userType && !isValidUserType(userType)) {
    const badRequestError = new Error("Invalid userType");
    (badRequestError as Error & { statusCode?: number }).statusCode = 400;
    throw badRequestError;
  }

  if (profileType && !["individual", "company", "koperasi"].includes(profileType)) {
    const badRequestError = new Error("Invalid profileType");
    (badRequestError as Error & { statusCode?: number }).statusCode = 400;
    throw badRequestError;
  }

  const [existingClerkUser, existingDbUser] = await Promise.all([
    findClerkUserByEmail(normalizedEmail),
    db.user.findFirst({ where: { email: normalizedEmail } }),
  ]);

  if (existingClerkUser || existingDbUser) {
    const conflictError = new Error("User already exists");
    (conflictError as Error & { statusCode?: number }).statusCode = 409;
    throw conflictError;
  }

  const clerkUser = await clerkClient.users.createUser({
    emailAddress: [normalizedEmail],
    password,
    firstName,
    lastName,
  });

  const appUser = await syncPostgresUser({
    clerkId: clerkUser.id,
    email: normalizedEmail,
    phone,
    userType,
  });

  await upsertUserProfileDetail(appUser.id, {
    email,
    password,
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

  return {
    message: "Signup successful",
    user: appUser,
  };
};

export const loginUser = async ({ email, password }: LoginPayload) => {
  const normalizedEmail = normalizeEmail(email);

  const clerkUser = await findClerkUserByEmail(normalizedEmail);
  if (!clerkUser) {
    const authError = new Error("Invalid credentials");
    (authError as Error & { statusCode?: number }).statusCode = 401;
    throw authError;
  }

  await clerkClient.users.verifyPassword({
    userId: clerkUser.id,
    password,
  });

  const session = await clerkClient.sessions.createSession({
    userId: clerkUser.id,
  });

  const sessionToken = await clerkClient.sessions.getToken(session.id);

  const appUser = await syncPostgresUser({
    clerkId: clerkUser.id,
    email: normalizedEmail,
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber,
  });

  return {
    message: "Login successful",
    user: appUser,
    sessionId: session.id,
    sessionToken: sessionToken.jwt,
  };
};

export const logoutUser = async (sessionId: string) => {
  await clerkClient.sessions.revokeSession(sessionId);
  return { message: "Logged out successfully" };
};

export const refreshSessionToken = async (sessionId: string) => {
  try {
    const sessionToken = await clerkClient.sessions.getToken(sessionId);
    return {
      message: "Session refreshed",
      sessionToken: sessionToken.jwt,
    };
  } catch (error: unknown) {
    const refreshError = new Error("Session expired or invalid");
    (refreshError as Error & { statusCode?: number }).statusCode = 401;
    throw refreshError;
  }
};

export const syncCurrentUserByClerkId = async (clerkUserId: string) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const primaryEmail = clerkUser.emailAddresses.find(
    (item) => item.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  const appUser = await syncPostgresUser({
    clerkId: clerkUser.id,
    email: primaryEmail ?? `${clerkUser.id}@placeholder.clerk`,
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber,
  });

  return appUser;
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

  try {
    await clerkClient.users.deleteUser(user.clerkId);
  } catch {
    // Best-effort cleanup in Clerk after successful local deletion.
  }

  return { message: "User deleted successfully" };
};

export const getRequesterUserFromToken = async (token: string): Promise<User> => {
  const { verifyToken } = await import("@clerk/backend");

  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  if (!payload.sub) {
    const unauthorizedError = new Error("Unauthorized");
    (unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
    throw unauthorizedError;
  }

  return syncCurrentUserByClerkId(payload.sub);
};
