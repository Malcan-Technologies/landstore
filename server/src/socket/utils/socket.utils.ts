import type { AppSocket } from "../types/socket.types.js";

const parseCookie = (cookieHeader: string | undefined, key: string): string | undefined => {
	if (!cookieHeader) return undefined;

	const cookies = cookieHeader.split(";");
	for (const cookieItem of cookies) {
		const [cookieKey, ...rest] = cookieItem.trim().split("=");
		if (cookieKey === key) {
			return rest.join("=");
		}
	}

	return undefined;
};

export const getSessionTokenFromSocket = (socket: AppSocket): string | undefined => {
	const authHeader = socket.handshake.headers.authorization;
	if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
		const token = authHeader.slice("Bearer ".length).trim();
		if (token) return token;
	}

	const cookieHeader = socket.handshake.headers.cookie;
	if (typeof cookieHeader === "string") {
		const cookieToken = parseCookie(cookieHeader, "__session");
		if (cookieToken) return cookieToken;
	}

	const authToken = socket.handshake.auth?.token;
	if (typeof authToken === "string" && authToken.trim()) {
		return authToken.trim();
	}

	return undefined;
};

export const getAllowedOrigins = (): string[] => {
	return (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:5173")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
};
