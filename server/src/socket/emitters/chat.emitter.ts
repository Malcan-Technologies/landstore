import { SOCKET_EVENTS } from "../constants/events.js";
import { getOptionalIO } from "../index.js";
import {
	getEnquiryRoomName,
	getUserRoomName,
} from "../rooms/room.manager.js";
import type { ChatMessageRealtimePayload } from "../types/socket.types.js";

export const emitChatMessage = (payload: ChatMessageRealtimePayload): void => {
	const io = getOptionalIO();
	if (!io) return;

	const targetRooms = [
		getEnquiryRoomName(payload.enquiryId),
		getUserRoomName(payload.senderId),
		getUserRoomName(payload.receiverId),
	];

	const uniqueRooms = Array.from(new Set(targetRooms));
	for (const room of uniqueRooms) {
		io.to(room).emit(SOCKET_EVENTS.CHAT.NEW_MESSAGE, payload);
	}
};
