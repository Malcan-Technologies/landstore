import { clerkClient } from "@clerk/express";
import db from "../../config/prisma.ts";

type SignUpPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

type LoginPayload = {
  email: string;
  password: string;
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
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
}) => {
  const { clerkId, email, firstName, lastName, name } = params;

  return db.user.upsert({
    where: { clerkId },
    update: {
      email: normalizeEmail(email),
      name: buildDisplayName(firstName ?? undefined, lastName ?? undefined, name ?? undefined),
    },
    create: {
      clerkId,
      email: normalizeEmail(email),
      name: buildDisplayName(firstName ?? undefined, lastName ?? undefined, name ?? undefined),
    },
  });
};

export const signUpUser = async ({
  email,
  password,
  firstName,
  lastName,
  name,
}: SignUpPayload) => {
  const normalizedEmail = normalizeEmail(email);

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
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
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

export const syncCurrentUserByClerkId = async (clerkUserId: string) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const primaryEmail = clerkUser.emailAddresses.find(
    (item) => item.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  const appUser = await syncPostgresUser({
    clerkId: clerkUser.id,
    email: primaryEmail ?? `${clerkUser.id}@placeholder.clerk`,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  });

  return appUser;
};
