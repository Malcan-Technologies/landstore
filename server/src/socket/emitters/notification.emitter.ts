import { SOCKET_EVENTS } from "../constants/events.js";
import { getOptionalIO } from "../index.js";
import { getUserRoomName } from "../rooms/room.manager.js";
import type { NotificationRealtimePayload } from "../types/socket.types.js";

export const emitNotificationCreated = (
	payload: NotificationRealtimePayload
): void => {
	const io = getOptionalIO();
	if (!io) return;

	io.to(getUserRoomName(payload.userId)).emit(SOCKET_EVENTS.NOTIFICATION.CREATED, payload);
};

export const emitNotificationUpdated = (
	payload: NotificationRealtimePayload
): void => {
	const io = getOptionalIO();
	if (!io) return;

	io.to(getUserRoomName(payload.userId)).emit(SOCKET_EVENTS.NOTIFICATION.UPDATED, payload);
};

export const emitNotificationDeleted = (userId: string, id: string): void => {
	const io = getOptionalIO();
	if (!io) return;

	io.to(getUserRoomName(userId)).emit(SOCKET_EVENTS.NOTIFICATION.DELETED, {
		id,
		userId,
	});
};

export const emitUnreadNotificationCount = (
	userId: string,
	unreadCount: number
): void => {
	const io = getOptionalIO();
	if (!io) return;

	io.to(getUserRoomName(userId)).emit(SOCKET_EVENTS.NOTIFICATION.UNREAD_COUNT, {
		userId,
		unreadCount,
	});
};
