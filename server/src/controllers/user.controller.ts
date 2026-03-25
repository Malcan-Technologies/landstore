import type { Request, Response } from "express";
import { verifyToken } from "@clerk/backend";
import {
	deleteUserById,
	getAllUsers,
	getRequesterUserFromToken,
	getUserById,
	loginUser,
	logoutUser,
	refreshSessionToken,
	signUpUser,
	syncCurrentUserByClerkId,
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

export const signUpController = async (req: Request, res: Response) => {
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
		} = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "email and password are required" });
		}

		if (userType && !["admin", "user"].includes(userType)) {
			return res.status(400).json({ message: "Invalid userType" });
		}

		if (profileType && !["individual", "company", "koperasi"].includes(profileType)) {
			return res.status(400).json({ message: "Invalid profileType" });
		}

		const response = await signUpUser({
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

		return res.status(201).json(response);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
    console.log("Error in signUpController:", error);
		return res.status(statusCode).json({ message });
	}
};

export const loginController = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "email and password are required" });
		}

		const response = await loginUser({ email, password });

		// Session expires in 8 hours (persistent login)
		const maxAge = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

		res.cookie("__session", response.sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge,
		});

		return res.status(200).json({
			message: response.message,
			user: response.user,
			sessionId: response.sessionId,
			sessionToken: response.sessionToken,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

const getTokenFromRequest = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
	return (req.cookies as Record<string, string>)?.["__session"] ?? null;
};

const getRequesterUserOrThrow = async (req: Request) => {
	const token = getTokenFromRequest(req);
	if (!token) {
		const unauthorizedError = new Error("Unauthorized");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return getRequesterUserFromToken(token);
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

export const logoutController = async (req: Request, res: Response) => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) return res.status(401).json({ message: "Unauthorized" });

		const payload = await verifyToken(token, {
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		if (!payload.sid) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const response = await logoutUser(payload.sid);
		res.clearCookie("__session", { path: "/" });
		return res.status(200).json(response);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const refreshSessionController = async (req: Request, res: Response) => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) return res.status(401).json({ message: "Unauthorized" });

		const payload = await verifyToken(token, {
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		if (!payload.sid) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const response = await refreshSessionToken(payload.sid);

		// Update cookie with new token and 8-hour expiry
		const maxAge = 8 * 60 * 60 * 1000; // 8 hours

		res.cookie("__session", response.sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge,
		});

		return res.status(200).json(response);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const getCurrentUserController = async (req: Request, res: Response) => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) return res.status(401).json({ message: "Unauthorized" });

		const payload = await verifyToken(token, {
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		if (!payload.sub) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const user = await syncCurrentUserByClerkId(payload.sub);

		return res.status(200).json({ user });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

export const getAllUsersController = async (req: Request, res: Response) => {
	try {
		const requester = await getRequesterUserOrThrow(req);
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
		const requester = await getRequesterUserOrThrow(req);
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
		const requester = await getRequesterUserOrThrow(req);
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
		const requester = await getRequesterUserOrThrow(req);
		assertAdminOrThrow(requester.userType);
		const userId = getUserIdParamOrThrow(req);

		const result = await deleteUserById(userId);
		return res.status(200).json(result);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};
