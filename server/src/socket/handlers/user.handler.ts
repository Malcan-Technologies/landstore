import { SOCKET_EVENTS } from "../constants/events.js";
import { joinAdminRoom, joinUserRoom } from "../rooms/room.manager.js";
import type { AppServer, AppSocket } from "../types/socket.types.js";

export const registerUserHandler = async (
	io: AppServer,
	socket: AppSocket
): Promise<void> => {
	const userId = socket.data.user?.id;
	if (!userId) {
		socket.emit(SOCKET_EVENTS.SYSTEM.ERROR, {
			message: "Missing authenticated user in socket data",
		});
		socket.disconnect(true);
		return;
	}

	await joinUserRoom(socket, userId);

	if (socket.data.user?.userType && ["admin", "superadmin"].includes(socket.data.user.userType.toLowerCase())) {
		await joinAdminRoom(socket);
	}

	socket.emit(SOCKET_EVENTS.USER.CONNECTED, { userId });

	socket.on("disconnect", () => {
		io.to(socket.id).emit(SOCKET_EVENTS.USER.DISCONNECTED, { userId });
	});
};
