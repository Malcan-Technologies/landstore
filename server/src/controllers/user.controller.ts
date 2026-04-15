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
import { randomBytes } from "crypto";
import { hashPassword } from "better-auth/crypto";
import {
	completeUserProfile,
	deleteUserById,
	getAllUsers,
	getUserById,
	updateUserById,
	getUserCompleteProfile,
	signUpAndCompleteProfile,
	getUserByEmail
} from "../services/user.js";
import { emailService } from "../services/email.js";
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

		// Generate email verification token
		const verificationToken = randomBytes(32).toString("hex");
		
		// Create verification URL
		const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3001";
		const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
		const verificationURL = `${baseURL}/api/users/verify-email-callback?token=${verificationToken}&redirectTo=${encodeURIComponent(frontendURL)}`;

		// Store verification token in database with 24 hour expiration
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

		// Fetch complete profile with all details
		const completeProfile = await getUserCompleteProfile(result.userId);

		return res.status(201).json({
			success: true,
			message: "User registered successfully. Please check your email to verify your account.",
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

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const result = await getAllUsers(page, limit);
		return res.status(200).json({ data: result.items, pagination: result.pagination });
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

/**
 * REQUEST PASSWORD RESET
 * POST /api/users/forgot-password
 * Body: { email }
 * 
 * Generates a reset token and sends magic link via email
 */
export const requestPasswordResetController = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		if (!email || typeof email !== "string" || !email.trim()) {
			return res.status(400).json({
				success: false,
				message: "Valid email is required",
			});
		}

		// Check if user exists
		const user = await getUserByEmail(email.toLowerCase());
		if (!user) {
			// Don't reveal if email exists (security best practice)
			return res.status(200).json({
				success: true,
				message: "If the email exists, a password reset link has been sent",
			});
		}

		// Generate secure reset token
		const resetToken = randomBytes(32).toString("hex");
		
		// Create reset URL with token and redirect URL
		const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3001";
		const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
		const resetURL = `${baseURL}/api/users/reset-password-callback?token=${resetToken}&redirectTo=${encodeURIComponent(frontendURL + "/reset-password")}`;

		// Store reset token in database with 1 hour expiration
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		// Store using Verification table from Better Auth
		await db.verification.create({
			data: {
				identifier: `password_reset_${email.toLowerCase()}`,
				value: resetToken,
				token: resetToken,
				expiresAt: expiresAt,
			},
		});

		// Send email with reset link
		await emailService.sendMagicLink(email.toLowerCase(), resetToken, resetURL);

		return res.status(200).json({
			success: true,
			message: "Password reset link has been sent to your email",
			expiresIn: 3600, // 1 hour in seconds
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * RESET PASSWORD CALLBACK (Optional - for email clicks)
 * GET /api/users/reset-password-callback
 * Query: { token, redirectTo }
 */
export const resetPasswordCallbackController = async (req: Request, res: Response) => {
	try {
		const { token, redirectTo } = req.query;

		if (!token || typeof token !== "string") {
			return res.redirect(
				`${redirectTo || "http://localhost:5173/reset-password"}?error=invalid_token`
			);
		}

		// Verify token exists and not expired
		const verification = await db.verification.findFirst({
			where: {
				token: token,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (!verification) {
			return res.redirect(
				`${redirectTo || "http://localhost:5173/reset-password"}?error=expired_token`
			);
		}

		// Redirect to frontend with token
		return res.redirect(
			`${redirectTo || "http://localhost:5173/reset-password"}?token=${token}`
		);
	} catch (error: unknown) {
		return res.redirect(
			`${(req.query.redirectTo as string) || "http://localhost:5173/reset-password"}?error=server_error`
		);
	}
};

/**
 * RESET PASSWORD
 * POST /api/users/reset-password
 * Body: { token, newPassword }
 * 
 * Verifies token and resets the password
 */
export const resetPasswordController = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || typeof token !== "string") {
			return res.status(400).json({
				success: false,
				message: "Valid reset token is required",
			});
		}

		if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 8 characters",
			});
		}

		// Verify token exists and not expired
		const verification = await db.verification.findFirst({
			where: {
				token: token,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (!verification) {
			return res.status(400).json({
				success: false,
				message: "Reset token is invalid or expired",
			});
		}

		// Extract email from identifier (format: "password_reset_{email}")
		const email = verification.identifier.replace("password_reset_", "");
		
		const user = await getUserByEmail(email);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Update password in Account table with hashed password
		// Use Better Auth's native hashPassword function (same as signup)
		const hashedPassword = await hashPassword(newPassword);
		
		await db.account.updateMany({
			where: {
				userId: user.id,
				providerId: "credential",
			},
			data: {
				password: hashedPassword,
			},
		});

		// Delete the used verification token
		await db.verification.delete({
			where: {
				id: verification.id,
			},
		});

		return res.status(200).json({
			success: true,
			message: "Password has been reset successfully. Please log in with your new password.",
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * VERIFY EMAIL CALLBACK (for email clicks)
 * GET /api/users/verify-email-callback
 * Query: { token, redirectTo }
 */
export const verifyEmailCallbackController = async (req: Request, res: Response) => {
	try {
		const { token, redirectTo } = req.query;

		if (!token || typeof token !== "string") {
			return res.redirect(
				`${redirectTo || "http://localhost:5173"}?error=invalid_token`
			);
		}

		// Verify token exists and not expired
		const verification = await db.verification.findFirst({
			where: {
				token: token,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (!verification) {
			return res.redirect(
				`${redirectTo || "http://localhost:5173"}?error=expired_token`
			);
		}

		// Redirect to frontend with token for final confirmation
		return res.redirect(
			`${redirectTo || "http://localhost:5173"}?verificationToken=${token}`
		);
	} catch (error: unknown) {
		return res.redirect(
			`${(req.query.redirectTo as string) || "http://localhost:5173"}?error=server_error`
		);
	}
};

/**
 * CONFIRM EMAIL VERIFICATION
 * POST /api/users/verify-email
 * Body: { token }
 * 
 * Marks email as verified
 */
export const verifyEmailController = async (req: Request, res: Response) => {
	try {
		const { token } = req.body;

		if (!token || typeof token !== "string") {
			return res.status(400).json({
				success: false,
				message: "Valid verification token is required",
			});
		}

		// Verify token exists and not expired
		const verification = await db.verification.findFirst({
			where: {
				token: token,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (!verification) {
			return res.status(400).json({
				success: false,
				message: "Verification token is invalid or expired",
			});
		}

		// Extract email from identifier (format: "email_verification_{email}")
		const email = verification.identifier.replace("email_verification_", "");
		
		const user = await getUserByEmail(email);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Mark email as verified
		await db.user.update({
			where: { id: user.id },
			data: { emailVerified: true },
		});

		// Delete the used verification token
		await db.verification.delete({
			where: {
				id: verification.id,
			},
		});

		return res.status(200).json({
			success: true,
			message: "Email verified successfully. Your account is now active!",
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

