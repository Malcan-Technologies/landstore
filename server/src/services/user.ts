/**
 * USER SERVICE
 * 
 * UNIFIED REGISTRATION FLOW (Better Auth):
 * 1. Client calls POST /api/users/register with ALL data (email, password, profile info)
 *    → Better Auth hashes password and stores encrypted in Account.password
 *    → User record created with email
 *    → User profile completed with phone, userType, and custom fields
 *    → Returns full user profile with all details
 * 
 * 2. Client signs in via POST /api/auth/sign-in with email & password
 *    → Better Auth verifies password against Account.password (hashed comparison)
 *    → Session created and returned
 * 
 * ⚠️ IMPORTANT: Passwords are ALWAYS hashed by Better Auth before database storage.
 * Account.password field stores ONLY hashed passwords, never plain text.
 */

import db from "../../config/prisma.js";
import { auth } from "../../config/auth.js";
import type { User, UserType } from "@prisma/client";

type UpdateUserPayload = {
  email?: string;
  phone?: string | null;
  userType?: UserType;
};

type CreateUserProfilePayload = {
  email: string;
  userType?: UserType | undefined;
  phone?: string | undefined;
  profileType?: "individual" | "company" | "koperasi" | undefined;
  fullName?: string | undefined;
  identityNo?: string | undefined;
  companyName?: string | undefined;
  koperasiName?: string | undefined;
  registrationNo?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  name?: string | undefined;
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

/**
 * Register and complete profile in one transaction
 * Combines sign-up and profile completion into a single operation
 * Note: Password is managed by Better Auth through /api/auth endpoints
 */
export const registerAndCompleteProfile = async (
	email: string,
	profileData: Omit<CreateUserProfilePayload, "email">
) => {
	const normalizedEmail = normalizeEmail(email);

	// Step 1: Create user directly (Better Auth handles password hashing via sign-up)
	try {
		const user = await db.user.create({
			data: {
				email: normalizedEmail,
				name: profileData.name || 
					`${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || 
					normalizedEmail,
			},
		});

		if (!user?.id) {
			throw new Error("Failed to create user account");
		}

		const userId = user.id;

		// Step 2: Complete profile in transaction
		const completeProfileResult = await db.$transaction(async (trx: any) => {
			// Update user with business fields
			const updatedUser = await trx.user.update({
				where: { id: userId },
				data: {
					phone: normalizePhone(profileData.phone),
					userType: profileData.userType ?? "user",
				},
			});

			// Create appropriate profile type
			await createUserProfileType(trx, userId, profileData);

			return updatedUser;
		});

		return {
			userId: userId,
			user: completeProfileResult,
			success: true,
		};
	} catch (error: unknown) {
		const errorMessage = (error as any)?.message || "Failed to register user";
		
		// Check for duplicate email
		if ((error as any)?.code === "P2002") {
			const err = new Error("Email already exists");
			(err as Error & { statusCode?: number }).statusCode = 409;
			throw err;
		}

		const err = new Error(errorMessage);
		(err as Error & { statusCode?: number }).statusCode = 400;
		throw err;
	}
};

/**
 * Helper: Create user profile based on profile type
 */
const createUserProfileType = async (
	trx: any,
	userId: string,
	profileData: Omit<CreateUserProfilePayload, "email">
) => {
	const profileType =
		profileData.profileType ??
		(profileData.companyName ? "company" : profileData.koperasiName ? "koperasi" : "individual");

	if (profileType === "individual") {
		const fullName =
			profileData.fullName ??
			buildDisplayName(profileData.firstName, profileData.lastName, profileData.name);

		if (!fullName) {
			throw new Error("fullName is required for individual profile");
		}

		await trx.individual.create({
			data: {
				userId,
				fullName,
				identityNo: profileData.identityNo ?? null,
			},
		});
	} else if (profileType === "company") {
		const companyName = profileData.companyName ?? profileData.name?.trim();

		if (!companyName) {
			throw new Error("companyName is required for company profile");
		}

		await trx.company.create({
			data: {
				userId,
				companyName,
				registrationNo: profileData.registrationNo ?? null,
			},
		});
	} else if (profileType === "koperasi") {
		const koperasiName = profileData.koperasiName ?? profileData.name?.trim();

		if (!koperasiName) {
			throw new Error("koperasiName is required for koperasi profile");
		}

		await trx.koperasi.create({
			data: {
				userId,
				koperasiName,
				registrationNo: profileData.registrationNo ?? null,
			},
		});
	}
};

// Update user profile after Better Auth signup
// Better Auth has already created the User record
export const completeUserProfile = async (
	payload: CreateUserProfilePayload
) => {
	const normalizedEmail = normalizeEmail(payload.email);

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
			phone: normalizePhone(payload.phone),
			userType: payload.userType ?? "user",
		},
	});

	// Create user profile details
	await upsertUserProfileDetail(user.id, payload);

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

/**
 * UNIFIED REGISTRATION: Sign up with password hash + complete profile in ONE call
 * 
 * This function:
 * 1. Creates user with email & hashed password via Better Auth
 * 2. Completes user profile (phone, userType, custom fields)
 * 3. Returns full profile
 * 
 * Password is automatically hashed by Better Auth before database storage
 */
export const signUpAndCompleteProfile = async (
  email: string,
  password: string,
  profileData: Omit<CreateUserProfilePayload, "email">
) => {
  const normalizedEmail = normalizeEmail(email);

  try {
    // Step 1: Create user and account with password via Better Auth
    // Better Auth automatically hashes the password
    // The signUpEmail endpoint returns { token, user }
    const displayName = profileData.name || 
      `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || 
      normalizedEmail;

    const response = await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password,
        name: displayName,
      },
    });

    // Check if user was created successfully
    if (!response?.user?.id) {
      const err = new Error("Failed to sign up. Email may already be registered.");
      (err as Error & { statusCode?: number }).statusCode = 409;
      throw err;
    }

    const userId = response.user.id;

    // Step 2: Complete profile in transaction
    const completeProfileResult = await db.$transaction(async (trx: any) => {
      // Update user with business fields
      const updatedUser = await trx.user.update({
        where: { id: userId },
        data: {
          phone: normalizePhone(profileData.phone),
          userType: profileData.userType ?? "user",
        },
      });

      // Create appropriate profile type
      await createUserProfileType(trx, userId, profileData);

      return updatedUser;
    });

    return {
      userId: userId,
      user: completeProfileResult,
      success: true,
    };
  } catch (error: unknown) {
    const errorMessage = (error as any)?.message || "Failed to register user";
    
    // Check for duplicate email
    if ((error as any)?.code === "P2002" || errorMessage.includes("already exists") || errorMessage.includes("already been registered")) {
      const err = new Error("Email already registered. Please sign in instead.");
      (err as Error & { statusCode?: number }).statusCode = 409;
      throw err;
    }

    const err = new Error(errorMessage);
    (err as Error & { statusCode?: number }).statusCode = (error as any)?.statusCode || 400;
    throw err;
  }
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
    const err = error as Error & { code?: string };
    if (err?.code === "P2025") {
      const notFoundError = new Error("User not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    if (err?.code === "P2002") {
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
    const err = error as Error & { code?: string };
    if (err?.code === "P2003") {
      const conflictError = new Error("Cannot delete user due to related records");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    throw error;
  }

  return { message: "User deleted successfully" };
};

export const getUserCompleteProfile = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      individuals: true,
      companies: true,
      koperasi: true,
      notificationPrefs: true,
      profileMedia: true,
      entityTypes: {
        include: {
          entityType: true,
        },
      },
    },
  });

  if (!user) {
    const notFoundError = new Error("User not found");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  // Determine profile type
  let profileType: "individual" | "company" | "koperasi" | null = null;
  if (user.individuals) {
    profileType = "individual";
  } else if (user.companies) {
    profileType = "company";
  } else if (user.koperasi) {
    profileType = "koperasi";
  }

  // Build individual profile if exists (with all fields)
  const individual = user.individuals
    ? {
        id: user.individuals.id,
        userId: user.individuals.userId,
        fullName: user.individuals.fullName,
        identityNo: user.individuals.identityNo,
        createdAt: user.individuals.createdAt,
        updatedAt: user.individuals.updatedAt,
      }
    : null;

  // Build company profile if exists (with all fields)
  const company = user.companies
    ? {
        id: user.companies.id,
        userId: user.companies.userId,
        companyName: user.companies.companyName,
        registrationNo: user.companies.registrationNo,
        createdAt: user.companies.createdAt,
        updatedAt: user.companies.updatedAt,
      }
    : null;

  // Build koperasi profile if exists (with all fields)
  const koperasi = user.koperasi
    ? {
        id: user.koperasi.id,
        userId: user.koperasi.userId,
        koperasiName: user.koperasi.koperasiName,
        registrationNo: user.koperasi.registrationNo,
        createdAt: user.koperasi.createdAt,
        updatedAt: user.koperasi.updatedAt,
      }
    : null;

  // Build notification preferences
  const notificationPreferences = user.notificationPrefs
    ? {
        id: user.notificationPrefs.id,
        userId: user.notificationPrefs.userId,
        emailEnabled: user.notificationPrefs.emailEnabled,
        pushEnabled: user.notificationPrefs.pushEnabled,
        createdAt: user.notificationPrefs.createdAt,
        updatedAt: user.notificationPrefs.updatedAt,
      }
    : null;

  // Build profile media
  const profilePicture = user.profileMedia
    ? {
        id: user.profileMedia.id,
        fileUrl: user.profileMedia.fileUrl,
        mediaType: user.profileMedia.mediaType,
        mediaCategory: user.profileMedia.mediaCategory,
        userId: user.profileMedia.userId,
      }
    : null;

  // Build entity types list
  const entityTypesData = user.entityTypes.map((ue) => ({
    id: ue.id,
    entityTypeId: ue.entityTypeId,
    entityType: ue.entityType,
  }));

  // Build complete profile response with all fields
  const profile = {
    // Basic user info from Better Auth and user table
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    userType: user.userType,
    phone: user.phone,
    profileMediaId: user.profileMediaId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    // Profile type and specific details
    profileType,
    individual,
    company,
    koperasi,

    // Profile picture/media
    profilePicture,

    // User preferences
    notificationPreferences,

    // Entity types associated with user
    entityTypes: entityTypesData,
  };

  return profile;
};
