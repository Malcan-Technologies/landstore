import { socketAuthMiddleware } from "./middleware/auth.middleware.js";
import { socketRateLimitMiddleware } from "./middleware/rateLimit.middleware.js";
import {
	registerChatHandler,
	registerNotificationHandler,
	registerUserHandler,
} from "./handlers/index.js";
import type { AppServer } from "./types/socket.types.js";

let ioInstance: AppServer | undefined;

export const initializeSocket = (io: AppServer): AppServer => {
	if (ioInstance) return ioInstance;

	ioInstance = io;
	io.use(socketRateLimitMiddleware);
	io.use(socketAuthMiddleware);

	io.on("connection", async (socket) => {
		await registerUserHandler(io, socket);
		registerNotificationHandler(socket);
		registerChatHandler(socket);
	});

	return ioInstance;
};

export const getIO = (): AppServer => {
	if (!ioInstance) {
		throw new Error("Socket server has not been initialized");
	}

	return ioInstance;
};

export const getOptionalIO = (): AppServer | undefined => ioInstance;
