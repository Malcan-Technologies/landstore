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
	getUserByEmail,
	getUserGrowthOverTime,
	getUserBreakdownByType
} from "../services/user.js";
import { emailService } from "../services/email.js";
import { uploadFileToS3 } from "../services/s3Upload.js";
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
			name,
			entityTypes
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

		// Normalize entityTypes to array
		let normalizedEntityTypes: (string | undefined)[] | undefined;
		if (entityTypes) {
			if (Array.isArray(entityTypes)) {
				normalizedEntityTypes = entityTypes;
			} else if (typeof entityTypes === "string") {
				// Handle comma-separated string
				const parsed = entityTypes.split(",").map((id: string) => id.trim()).filter((id: string) => id.length > 0);
				normalizedEntityTypes = parsed.length > 0 ? parsed : undefined;
			}
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
			name,
			...(normalizedEntityTypes !== undefined && { entityTypes: normalizedEntityTypes })
		});

		if (req.file) {
			const fileKey = await uploadFileToS3(req.file);
			const profileMedia = await db.media.create({
				data: {
					userId: result.userId,
					fileUrl: fileKey,
					mediaType: req.file.mimetype,
					mediaCategory: "profileImage",
				},
			});

			await db.user.update({
				where: { id: result.userId },
				data: { profileMediaId: profileMedia.id },
			});
		}

		// Generate email verification token
		const verificationToken = randomBytes(32).toString("hex");

		// Create verification URL - send directly to frontend with token
		// const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
		const frontendURL = "https://landstore.my";
		const verificationURL = `${frontendURL}/verify-email-callback?token=${verificationToken}`;

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
 * Uses Better Auth's sign-in which handles:
 * - Password verification
 * - Session creation  
 * - Cookie management (httpOnly, secure, sameSite)
 * 
 * Then enriches response with userType and sends welcome email
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

		const user = await getUserByEmail(email);

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User not found",
			});
		}

		if (user.emailVerified != true) {
			return res.status(400).json({
				success: false,
				message: "Email is not verified",
			});
		}

		if (user.status === "suspended") {
			return res.status(403).json({

				success: false,
				message: "Your account is suspended. Contact admin",
			});
		}


		try {
			// Call Better Auth with proper request context - convert headers to array format
			const headerArray = Object.entries(req.headers).map(([key, value]) =>
				[key, String(value)] as [string, string]
			);

			const betterAuthResponse = await auth.api.signInEmail({
				body: {
					email: email.toLowerCase(),
					password,
				},
				headers: new Headers(headerArray), // ✅ Pass headers in proper format
				asResponse: true,
			});

			// Get Set-Cookie header from Better Auth response
			// Better Auth returns multiple cookies separated by commas
			const setCookieHeader = betterAuthResponse.headers.get("set-cookie");
			if (setCookieHeader) {
				// Split multiple cookies and set them as an array
				const cookies = setCookieHeader.split(", ");
				res.setHeader("set-cookie", cookies);
			}

			// Parse the response body
			let responseBody: any = null;
			if (betterAuthResponse?.body) {
				try {
					const bodyText = await betterAuthResponse.text();
					responseBody = JSON.parse(bodyText);
				} catch (parseError) {
					console.error("Failed to parse Better Auth response body:", parseError);
					return res.status(500).json({
						success: false,
						message: "Failed to process login response",
					});
				}
			}

			// Check if sign-in was successful
			if (!responseBody?.user?.id || !responseBody?.user?.email) {
				return res.status(401).json({
					success: false,
					message: "Invalid email or password",
				});
			}

			// Prepare userName for welcome email
			const emailPrefix = responseBody.user.email.split('@')[0];
			const userName = responseBody.user.name || emailPrefix || 'User';

			// Send welcome email asynchronously (don't wait for it)
			emailService.sendWelcomeEmail(
				responseBody.user.email,
				userName
			).catch((error) => {
				console.error("Failed to send welcome email:", error);
				// Continue with login response even if email fails
			});

			// Return enhanced response with userType
			// Session cookie is managed by Better Auth with all session config applied
			return res.status(200).json({
				success: true,
				redirect: false,
				token: responseBody.session?.token || "",
				user: {
					id: responseBody.user.id,
					name: responseBody.user.name,
					email: responseBody.user.email,
					emailVerified: responseBody.user.emailVerified,
					image: responseBody.user.image,
					userType: user.userType, // Include userType from database
					createdAt: responseBody.user.createdAt,
					updatedAt: responseBody.user.updatedAt,
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

		// Fetch user statistics in parallel
		const [totalListings, totalShortlisted, totalEnquiries] = await Promise.all([
			// Count total listings owned by this user
			db.property.count({
				where: { userId: user.id }
			}),
			// Count total shortlisted properties by this user
			db.shortlistProperty.count({
				where: {
					folder: {
						userId: user.id
					}
				}
			}),
			// Count total enquiries by this user
			db.propertyEnquiry.count({
				where: { userId: user.id }
			})
		]);

		return res.status(200).json({
			user,
			statistics: {
				totalListings,
				totalShortlisted,
				totalEnquiries
			}
		});
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

		// Get user ID from authenticated user (req.user.id)
		const targetUserId = requester.id;
		console.log(`🔄 Updating user profile for: ${targetUserId}`);

		// Users cannot modify their own role or allow role changes
		if (req.body.userType !== undefined) {
			return res.status(403).json({
				error: "Forbidden",
				message: "You cannot modify your own role. Contact support if you need role changes."
			});
		}

		// Build update payload
		const updatePayload: any = {
			email: req.body.email,
			phone: req.body.phone,
		};

		// Handle profile image upload
		if (req.file) {
			try {
				const fileKey = await uploadFileToS3(req.file);
				const profileMedia = await db.media.create({
					data: {
						userId: targetUserId,
						fileUrl: fileKey,
						mediaType: req.file.mimetype,
						mediaCategory: "profileImage",
					},
				});

				updatePayload.profileMediaId = profileMedia.id;
			} catch (uploadError) {
				console.error(`❌ Failed to upload profile image:`, uploadError);
				return res.status(500).json({
					error: "Upload failed",
					message: "Failed to upload profile image. Please try again.",
				});
			}
		}

		const user = await updateUserById(targetUserId, updatePayload);

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

		const userId = getUserIdParamOrThrow(req);
		if (requester.id === userId && (requester.userType === "admin" || requester.userType === "superadmin")) {
			return res.status(403).json({
				error: "Forbidden",
				message: "Admins and superadmins cannot delete themselves."
			});
		}

		// Fetch target user
		const targetUser = await getUserById(userId);
		if (!targetUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Superadmin can delete admin or user
		if (requester.userType === "superadmin") {
			if (["admin", "user"].includes(targetUser.userType)) {
				const result = await deleteUserById(userId);
				return res.status(200).json(result);
			} else {
				return res.status(403).json({ message: "Superadmin can only delete admin or user." });
			}
		}

		// Admin can delete other admin or user (but not themselves)
		if (requester.userType === "admin" && requester.id !== userId && ["admin", "user"].includes(targetUser.userType)) {
			const result = await deleteUserById(userId);
			return res.status(200).json(result);
		}

		return res.status(403).json({ message: "You do not have permission to delete this user." });
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

		// Create reset URL - send directly to frontend with token
		const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
		const resetURL = `${frontendURL}?token=${resetToken}`;

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
 * Redirects to http://localhost:3000 with token for password reset
 */
export const resetPasswordCallbackController = async (req: Request, res: Response) => {
	try {
		const { token, redirectTo } = req.query;

		if (!token || typeof token !== "string") {
			return res.redirect(
				`${redirectTo || "http://localhost:3000"}?error=invalid_token`
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
				`${redirectTo || "http://localhost:3000"}?error=expired_token`
			);
		}

		// Redirect to frontend with token
		return res.redirect(
			`${redirectTo || "http://localhost:3000"}?token=${token}`
		);
	} catch (error: unknown) {
		return res.redirect(
			`${(req.query.redirectTo as string) || "http://localhost:3000"}?error=server_error`
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
 * Redirects to http://localhost:3000 with token for email verification
 */
export const verifyEmailCallbackController = async (req: Request, res: Response) => {
	try {
		const { token, redirectTo } = req.query;

		if (!token || typeof token !== "string") {
			return res.redirect(
				`${redirectTo || "http://localhost:3000"}?error=invalid_token`
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
				`${redirectTo || "http://localhost:3000"}?error=expired_token`
			);
		}

		// Redirect to frontend with token for final confirmation
		return res.redirect(
			`${redirectTo || "http://localhost:3000"}?verificationToken=${token}`
		);
	} catch (error: unknown) {
		return res.redirect(
			`${(req.query.redirectTo as string) || "http://localhost:3000"}?error=server_error`
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

/**
 * Get user growth analytics over time
 * Supports time ranges: 12months, 30days, 7days, 24hours
 * Can filter by profile type: individual, company, koperasi
 */
export const getUserGrowthController = async (req: Request, res: Response) => {
	try {
		const { timeRange, profileType } = req.query;
		console.log(req.query);

		// Set default timeRange to "12months" if not provided
		const validatedTimeRange = (timeRange as string) || "12months";

		// Validate timeRange
		const validTimeRanges = ["12months", "30days", "7days", "24hours"];
		if (!validTimeRanges.includes(validatedTimeRange)) {
			return res.status(400).json({
				success: false,
				message: `Invalid timeRange. Must be one of: ${validTimeRanges.join(", ")}`,
			});
		}

		// Validate profileType if provided
		const validProfileTypes = ["individual", "company", "koperasi"];
		if (profileType && !validProfileTypes.includes(profileType as string)) {
			return res.status(400).json({
				success: false,
				message: `Invalid profileType. Must be one of: ${validProfileTypes.join(", ")}`,
			});
		}

		const growthData = await getUserGrowthOverTime(
			validatedTimeRange as "12months" | "30days" | "7days" | "24hours",
			profileType as "individual" | "company" | "koperasi" | undefined
		);

		return res.status(200).json({
			success: true,
			data: growthData,
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
 * Get user breakdown by entity type
 * Shows count of users by type: individual, company, koperasi
 * Supports time ranges: 12months, 30days, 7days, 24hours
 */
export const getUserBreakdownController = async (req: Request, res: Response) => {
	try {
		const { timeRange } = req.query;

		// Set default timeRange to "12months" if not provided
		const validatedTimeRange = (timeRange as string) || "12months";

		// Validate timeRange
		const validTimeRanges = ["12months", "30days", "7days", "24hours"];
		if (!validTimeRanges.includes(validatedTimeRange)) {
			return res.status(400).json({
				success: false,
				message: `Invalid timeRange. Must be one of: ${validTimeRanges.join(", ")}`,
			});
		}

		const breakdownData = await getUserBreakdownByType(
			validatedTimeRange as "12months" | "30days" | "7days" | "24hours"
		);

		return res.status(200).json({
			success: true,
			data: breakdownData,
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
 * Get user statistics (counts for listings, shortlistings, and enquiries)
 * GET /api/users/statistics
 */
export const getUserStatisticsController = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Authentication required. Please log in to access your statistics.",
			});
		}

		// Fetch user statistics in parallel
		const [totalListings, totalShortlisted, totalEnquiries] = await Promise.all([
			// Count total listings owned by this user
			db.property.count({
				where: { userId: user.id }
			}),
			// Count total shortlisted properties by this user
			db.shortlistProperty.count({
				where: {
					folder: {
						userId: user.id
					}
				}
			}),
			// Count total enquiries by this user
			db.propertyEnquiry.count({
				where: { userId: user.id }
			})
		]);

		return res.status(200).json({
			success: true,
			data: {
				totalListings,
				totalShortlisted,
				totalEnquiries
			}
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

