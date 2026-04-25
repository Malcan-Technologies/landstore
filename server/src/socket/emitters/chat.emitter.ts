import { SOCKET_EVENTS } from "../constants/events.js";
import { getOptionalIO } from "../index.js";
import {
	getAdminRoomName,
	getEnquiryRoomName,
	getUserRoomName,
} from "../rooms/room.manager.js";
import type {
	ChatMessageDeletedRealtimePayload,
	ChatMessageRealtimePayload,
} from "../types/socket.types.js";

const getChatAudienceRooms = (payload: {
	enquiryId: string;
	senderId: string;
	receiverId: string;
}): string[] => {
	const targetRooms = [
		getEnquiryRoomName(payload.enquiryId),
		getUserRoomName(payload.senderId),
		getUserRoomName(payload.receiverId),
		getAdminRoomName(),
	];

	return Array.from(new Set(targetRooms));
};

export const emitChatMessage = (payload: ChatMessageRealtimePayload): void => {
	const io = getOptionalIO();
	if (!io) return;

	for (const room of getChatAudienceRooms(payload)) {
		io.to(room).emit(SOCKET_EVENTS.CHAT.NEW_MESSAGE, payload);
	}
};

export const emitChatMessageUpdated = (
	payload: ChatMessageRealtimePayload
): void => {
	const io = getOptionalIO();
	if (!io) return;

	for (const room of getChatAudienceRooms(payload)) {
		io.to(room).emit(SOCKET_EVENTS.CHAT.UPDATED_MESSAGE, payload);
	}
};

export const emitChatMessageDeleted = (
	payload: ChatMessageDeletedRealtimePayload
): void => {
	const io = getOptionalIO();
	if (!io) return;

	for (const room of getChatAudienceRooms(payload)) {
		io.to(room).emit(SOCKET_EVENTS.CHAT.DELETED_MESSAGE, payload);
	}
};
