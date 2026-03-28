import type { Request, Response } from "express";
import {
	completeUserProfile,
	deleteUserById,
	getAllUsers,
	getUserById,
	updateUserById,
} from "../services/user.ts";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
	};
};

// Complete user profile after Better Auth signup
// Better Auth has already created the User record, this adds business-specific data
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

export const getCurrentUserController = async (req: Request, res: Response) => {
	try {
		// Better Auth provides user in request via middleware
		const user = (req as any).user;
		if (!user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		return res.status(200).json({ user });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
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
			return res.status(401).json({ message: "Unauthorized" });
		}

		assertAdminOrThrow(requester.userType);

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
			return res.status(401).json({ message: "Unauthorized" });
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
			return res.status(401).json({ message: "Unauthorized" });
		}

		const targetUserId = getUserIdParamOrThrow(req);

		if (requester.userType !== "admin" && requester.id !== targetUserId) {
			return res.status(403).json({ message: "Forbidden" });
		}

		if (requester.userType !== "admin" && req.body.userType !== undefined) {
			return res.status(403).json({ message: "Only admin can update userType" });
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
