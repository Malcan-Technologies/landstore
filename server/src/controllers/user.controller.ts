import type { Request, Response } from "express";
import { verifyToken } from "@clerk/backend";
import {
	loginUser,
	logoutUser,
	signUpUser,
	syncCurrentUserByClerkId,
} from "../services/user.ts";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? "Internal server error",
	};
};

export const signUpController = async (req: Request, res: Response) => {
	try {
		const { email, password, firstName, lastName, name } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "email and password are required" });
		}

		const response = await signUpUser({
			email,
			password,
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

		res.cookie("__session", response.sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
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
