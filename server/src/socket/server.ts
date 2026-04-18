import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { initializeSocket } from "./index.js";
import { getAllowedOrigins } from "./utils/socket.utils.js";
import type {
	AppServer,
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "./types/socket.types.js";

export const attachSocketServer = (httpServer: HttpServer): AppServer => {
	const allowedOrigins = getAllowedOrigins();

	const io = new Server<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>(httpServer, {
		cors: {
			origin: (origin, callback) => {
				if (!origin || allowedOrigins.includes(origin)) {
					return callback(null, true);
				}

				return callback(new Error("Socket origin not allowed"));
			},
			credentials: true,
		},
	});

	return initializeSocket(io);
};
