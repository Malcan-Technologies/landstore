import db from "../../../config/prisma.js";
import { SOCKET_EVENTS } from "../constants/events.js";
import {
	emitNotificationUpdated,
	emitUnreadNotificationCount,
} from "../emitters/notification.emitter.js";
import { isSocketEventAllowed } from "../middleware/rateLimit.middleware.js";
import { joinUserRoom } from "../rooms/room.manager.js";
import type { AppSocket } from "../types/socket.types.js";

const buildNotificationPayload = (notification: {
	id: string;
	userId: string;
	type: string;
	content: string;
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
}) => {
	return {
		id: notification.id,
		userId: notification.userId,
		type: notification.type,
		content: notification.content,
		isRead: notification.isRead,
		createdAt: notification.createdAt.toISOString(),
		updatedAt: notification.updatedAt.toISOString(),
	};
};

export const registerNotificationHandler = (socket: AppSocket): void => {
	const userId = socket.data.user?.id;
	if (!userId) return;

	socket.on(SOCKET_EVENTS.NOTIFICATION.SUBSCRIBE, async (ack) => {
		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.NOTIFICATION.SUBSCRIBE, 30)) {
				ack?.({ success: false, message: "Rate limit exceeded" });
				return;
			}

			await joinUserRoom(socket, userId);
			const unreadCount = await db.notification.count({
				where: {
					userId,
					isRead: false,
				},
			});

			emitUnreadNotificationCount(userId, unreadCount);
			ack?.({ success: true, data: { unreadCount } });
		} catch {
			ack?.({ success: false, message: "Failed to subscribe to notifications" });
		}
	});

	socket.on(SOCKET_EVENTS.NOTIFICATION.UNSUBSCRIBE, async (ack) => {
		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.NOTIFICATION.UNSUBSCRIBE, 30)) {
				ack?.({ success: false, message: "Rate limit exceeded" });
				return;
			}

			await socket.leave(`user:${userId}`);
			ack?.({ success: true });
		} catch {
			ack?.({ success: false, message: "Failed to unsubscribe from notifications" });
		}
	});

	socket.on(SOCKET_EVENTS.NOTIFICATION.MARK_READ, async (payload, ack) => {
		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.NOTIFICATION.MARK_READ, 50)) {
				ack?.({ success: false, message: "Rate limit exceeded" });
				return;
			}

			if (!payload.notificationId || !payload.notificationId.trim()) {
				ack?.({ success: false, message: "notificationId is required" });
				return;
			}

			const existing = await db.notification.findUnique({
				where: { id: payload.notificationId },
			});

			if (!existing || existing.userId !== userId) {
				ack?.({ success: false, message: "Notification not found" });
				return;
			}

			const updated = await db.notification.update({
				where: { id: payload.notificationId },
				data: { isRead: true },
			});

			const unreadCount = await db.notification.count({
				where: { userId, isRead: false },
			});

			emitNotificationUpdated(buildNotificationPayload(updated));
			emitUnreadNotificationCount(userId, unreadCount);
			ack?.({ success: true });
		} catch {
			ack?.({ success: false, message: "Failed to mark notification as read" });
		}
	});

	socket.on(SOCKET_EVENTS.NOTIFICATION.MARK_ALL_READ, async (ack) => {
		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.NOTIFICATION.MARK_ALL_READ, 25)) {
				ack?.({ success: false, message: "Rate limit exceeded" });
				return;
			}

			await db.notification.updateMany({
				where: { userId, isRead: false },
				data: { isRead: true },
			});

			emitUnreadNotificationCount(userId, 0);
			ack?.({ success: true });
		} catch {
			ack?.({ success: false, message: "Failed to mark all notifications as read" });
		}
	});
};
