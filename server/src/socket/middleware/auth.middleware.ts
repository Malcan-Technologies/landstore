import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../config/auth.js";
import type { AppSocket } from "../types/socket.types.js";

const SOCKET_UNAUTHORIZED_MESSAGE = "Unauthorized socket connection";

export const socketAuthMiddleware = async (
	socket: AppSocket,
	next: (err?: Error) => void
) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(socket.handshake.headers),
		});
		console.log(session);
		if (!session?.user?.id) {
			return next(new Error(SOCKET_UNAUTHORIZED_MESSAGE));
		}

		socket.data.user = {
			id: session.user.id,
			email: session.user.email,
		};

		return next();
	} catch {
		return next(new Error(SOCKET_UNAUTHORIZED_MESSAGE));
	}
};