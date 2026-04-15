/**
 * USER CONTROLLER
 * 
 * UNIFIED REGISTRATION & PROFILE COMPLETION:
 * 
 * Single endpoint for complete registration:
 * POST /api/users/register
 * 
 * Request:
 * {
 *   email: "user@example.com",
 *   password: "SecurePassword123!",
 *   name: "John Doe",
 *   phone: "+1234567890",
 *   userType: "user",
 *   profileType: "individual",
 *   firstName: "John",
 *   lastName: "Doe",
 *   ...
 * }
 * 
 * Response: Complete user profile
 * 
 * PASSWORD HANDLING:
 * - Password is hashed by Better Auth (never stored as plain text)
 * - Account.password stores encrypted hash
 * - User.password field does NOT exist
 */

import type { Request, Response } from "express";
import {
	completeUserProfile,
	deleteUserById,
	getAllUsers,
	getUserById,
	updateUserById,
	getUserCompleteProfile,
	signUpAndCompleteProfile,
	getUserByEmail,
} from "../services/user.js";
import { auth } from "../../config/auth.js";
import db from "../../config/prisma.js";

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
 * UNIFIED REGISTRATION ENDPOINT
 * 
 * Complete registration in ONE call with ALL user data
 * 
 * Request body:
 * {
 *   email: "user@example.com",
 *   password: "SecurePassword123!",  // Will be hashed by Better Auth
 *   name: "John Doe",
 *   phone: "+1234567890",
 *   userType: "user",                // or "admin"
 *   profileType: "individual",       // or "company", "koperasi"
 *   firstName: "John",               // for individual
 *   lastName: "Doe",                 // for individual
 *   fullName: "John Doe",            // for individual
 *   identityNo: "123456789",         // for individual
 *   companyName: "Acme Corp",        // for company
 *   koperasiName: "Koperasi ABC",    // for koperasi
 *   registrationNo: "REG123"         // for company/koperasi
 * }
 * 
 * Response: Complete user profile with all details
 */
export const registerAndCompleteProfileController = async (req: Request, res: Response) => {
	try {
		const {
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
			name
		} = req.body;

		// Validate required fields
		if (!email || typeof email !== "string" || !email.trim()) {
			return res.status(400).json({ message: "Valid email is required" });
		}
		if (!password || typeof password !== "string" || password.length < 8) {
			return res.status(400).json({ message: "Password must be at least 8 characters" });
		}
		if (userType && !["admin", "user"].includes(userType)) {
			return res.status(400).json({ message: "Invalid userType. Must be 'admin' or 'user'" });
		}
		if (profileType && !["individual", "company", "koperasi"].includes(profileType)) {
			return res.status(400).json({ 
				message: "Invalid profileType. Must be 'individual', 'company', or 'koperasi'" 
			});
		}

		// Sign up with password AND complete profile in ONE transaction
		// Better Auth automatically hashes password before database storage
		const result = await signUpAndCompleteProfile(email, password, {
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
			name
		});

		// Fetch complete profile with all details
		const completeProfile = await getUserCompleteProfile(result.userId);

		return res.status(201).json({
			success: true,
			message: "User registered successfully with hashed password",
			profile: completeProfile,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ 
			success: false,
			message 
		});
	}
};

// Complete user profile after Better Auth signup
// Better Auth has already created the User record
export const completeProfileController = async (req: Request, res: Response) => {
	try {
		const { email, userType, phone, profileType, fullName, identityNo, companyName, koperasiName, registrationNo, firstName, lastName, name } = req.body;

		if (!email) {
			return res.status(400).json({ message: "email is required" });
		}

		if (userType && !["admin", "user"].includes(userType)) {
			return res.status(400).json({ message: "Invalid userType" });
		}

		if (profileType && !["individual", "company", "koperasi"].includes(profileType)) {
			return res.status(400).json({ message: "Invalid profileType" });
		}

		const user = await completeUserProfile({
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

		return res.status(201).json({ message: "Profile completed successfully", user });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * LOGIN
 * POST /api/users/login
 * Body: { email, password }
 * 
 * Authenticates user and returns session with userType
 */
export const loginController = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || typeof email !== "string" || !email.trim()) {
			return res.status(400).json({
				success: false,
				message: "Valid email is required",
			});
		}

		if (!password || typeof password !== "string" || password.length < 1) {
			return res.status(400).json({
				success: false,
				message: "Password is required",
			});
		}

		try {
			// Call Better Auth sign-in endpoint
			const response = await auth.api.signInEmail({
				body: {
					email: email.toLowerCase(),
					password,
				},
			});

			// Check if sign-in was successful
			if (!response?.user?.id || !response?.user?.email) {
				return res.status(401).json({
					success: false,
					message: "Invalid email or password",
				});
			}

			// Fetch user with userType from database
			const user = await getUserByEmail(response.user.email);

			// Return enhanced response with userType
			return res.status(200).json({
				success: true,
				redirect: false,
				token: response.token || "",
				user: {
					id: response.user.id,
					name: response.user.name,
					email: response.user.email,
					emailVerified: response.user.emailVerified,
					image: response.user.image,
					userType: user.userType, // Include userType from database
					createdAt: response.user.createdAt,
					updatedAt: response.user.updatedAt,
				},
			});
		} catch (authError: unknown) {
			const err = authError as any;
			return res.status(401).json({
				success: false,
				message: err?.message || "Invalid email or password",
			});
		}
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const getCurrentUserController = async (req: Request, res: Response) => {
	try {
		// Better Auth provides user in request via middleware
		const user = (req as any).user;
		if (!user) {
			return res.status(401).json({ 
				error: "Unauthorized",
				message: "Authentication required. Please log in to access your profile." 
			});
		}

		return res.status(200).json({ user });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const getUserCompleteProfileController = async (req: Request, res: Response) => {
	try {
		// Better Auth provides user in request via middleware
		const user = (req as any).user;
		if (!user) {
			return res.status(401).json({ 
				error: "Unauthorized",
				message: "Authentication required. Please log in to access your profile." 
			});
		}

		const completeProfile = await getUserCompleteProfile(user.id);

		return res.status(200).json({ 
			success: true,
			message: "User profile retrieved successfully", 
			result: completeProfile 
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ 
			success: false,
			message 
		});
	}
};

/**
 * GET MY PROFILE
 * GET /api/users/my-profile
 * 
 * Get authenticated user's complete profile using req.user.id from middleware
 * Requires authentication
 */
export const getMyProfileController = async (req: Request, res: Response) => {
	try {
		// Get user ID from authenticated request (via requireApiAuth middleware)
		const user = (req as any).user;
		if (!user || !user.id) {
			return res.status(401).json({ 
				success: false,
				error: "Unauthorized",
				message: "Authentication required. Please log in to access your profile." 
			});
		}

		// Fetch complete profile using authenticated user ID
		const completeProfile = await getUserCompleteProfile(user.id);

		return res.status(200).json({ 
			success: true,
			message: "My profile retrieved successfully", 
			result: completeProfile 
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ 
			success: false,
			message 
		});
	}
};



const assertAdminOrThrow = (userType: string) => {
	if (userType !== "admin") {
		const forbiddenError = new Error("Forbidden");
		(forbiddenError as Error & { statusCode?: number }).statusCode = 403;
		throw forbiddenError;
	}
};

const getUserIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid user id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

export const getAllUsersController = async (req: Request, res: Response) => {
	try {
		const requester = (req as any).user;
		if (!requester) {
			return res.status(401).json({ 
				error: "Unauthorized",
				message: "Authentication required. Please log in to access this resource." 
			});
		}

		const users = await getAllUsers();
		return res.status(200).json({ users });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const getUserByIdController = async (req: Request, res: Response) => {
	try {
		const requester = (req as any).user;
		if (!requester) {
			return res.status(401).json({ 
				error: "Unauthorized",
				message: "Authentication required. Please log in to access this resource." 
			});
		}

		assertAdminOrThrow(requester.userType);
		const userId = getUserIdParamOrThrow(req);

		const user = await getUserById(userId);
		return res.status(200).json({ user });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const updateUserController = async (req: Request, res: Response) => {
	try {
		const requester = (req as any).user;
		if (!requester) {
			return res.status(401).json({ 
				error: "Unauthorized",
				message: "Authentication required. Please log in to access this resource." 
			});
		}

		const targetUserId = getUserIdParamOrThrow(req);

		if (requester.userType !== "admin" && requester.id !== targetUserId) {
			return res.status(403).json({ 
				error: "Forbidden",
				message: "You do not have permission to modify this user account." 
			});
		}

		if (requester.userType !== "admin" && req.body.userType !== undefined) {
			return res.status(403).json({ 
				error: "Forbidden",
				message: "Only administrators can modify user roles. Contact support if you need role changes." 
			});
		}

		const user = await updateUserById(targetUserId, {
			email: req.body.email,
			phone: req.body.phone,
			userType: req.body.userType,
		});

		return res.status(200).json({ message: "User updated successfully", user });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const deleteUserController = async (req: Request, res: Response) => {
	try {
		const requester = (req as any).user;
		if (!requester) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		assertAdminOrThrow(requester.userType);
		const userId = getUserIdParamOrThrow(req);

		const result = await deleteUserById(userId);
		return res.status(200).json(result);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};


