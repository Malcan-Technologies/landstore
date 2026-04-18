import db from "../../../config/prisma.js";
import { SOCKET_EVENTS } from "../constants/events.js";
import { emitChatMessage } from "../emitters/chat.emitter.js";
import { isSocketEventAllowed } from "../middleware/rateLimit.middleware.js";
import {
	getEnquiryRoomName,
	joinEnquiryRoom,
	leaveEnquiryRoom,
} from "../rooms/room.manager.js";
import type {
	AckResponse,
	AppSocket,
	ChatMessageRealtimePayload,
} from "../types/socket.types.js";

const canAccessEnquiry = async (
	enquiryId: string,
	userId: string
): Promise<{ canAccess: boolean; enquiryUserId?: string; propertyOwnerId?: string }> => {
	const enquiry = await db.propertyEnquiry.findUnique({
		where: { id: enquiryId },
		select: {
			id: true,
			userId: true,
			property: {
				select: {
					userId: true,
				},
			},
		},
	});

	if (!enquiry) {
		return { canAccess: false };
	}

	const enquiryUserId = enquiry.userId;
	const propertyOwnerId = enquiry.property.userId;
	const canAccess = userId === enquiryUserId || userId === propertyOwnerId;

	return {
		canAccess,
		enquiryUserId,
		propertyOwnerId,
	};
};

const toMessagePayload = (message: {
	id: string;
	enquiryId: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: Date;
}): ChatMessageRealtimePayload => {
	return {
		id: message.id,
		enquiryId: message.enquiryId,
		senderId: message.senderId,
		receiverId: message.receiverId,
		content: message.content,
		createdAt: message.createdAt.toISOString(),
	};
};

const inferReceiverId = (
	senderId: string,
	enquiryUserId?: string,
	propertyOwnerId?: string
): string | null => {
	if (enquiryUserId && enquiryUserId !== senderId) {
		return enquiryUserId;
	}

	if (propertyOwnerId && propertyOwnerId !== senderId) {
		return propertyOwnerId;
	}

	return null;
};

export const registerChatHandler = (socket: AppSocket): void => {
	const userId = socket.data.user?.id;
	if (!userId) return;

	socket.on(SOCKET_EVENTS.CHAT.JOIN_ENQUIRY, async (payload, ack) => {
		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.CHAT.JOIN_ENQUIRY, 60)) {
				ack?.({ success: false, message: "Rate limit exceeded" });
				return;
			}

			const enquiryId = payload.enquiryId?.trim();
			if (!enquiryId) {
				ack?.({ success: false, message: "enquiryId is required" });
				return;
			}

			const access = await canAccessEnquiry(enquiryId, userId);
			if (!access.canAccess) {
				ack?.({ success: false, message: "Forbidden to join this enquiry room" });
				return;
			}

			await joinEnquiryRoom(socket, enquiryId);
			const messages = await db.message.findMany({
				where: { enquiryId },
				orderBy: { createdAt: "asc" },
				take: 100,
			});

			socket.emit(SOCKET_EVENTS.CHAT.HISTORY, {
				enquiryId,
				messages: messages.map(toMessagePayload),
			});

			ack?.({ success: true, data: { enquiryId, room: getEnquiryRoomName(enquiryId) } });
		} catch {
			ack?.({ success: false, message: "Failed to join enquiry room" });
		}
	});

	socket.on(SOCKET_EVENTS.CHAT.LEAVE_ENQUIRY, async (payload, ack) => {
		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.CHAT.LEAVE_ENQUIRY, 60)) {
				ack?.({ success: false, message: "Rate limit exceeded" });
				return;
			}

			const enquiryId = payload.enquiryId?.trim();
			if (!enquiryId) {
				ack?.({ success: false, message: "enquiryId is required" });
				return;
			}

			await leaveEnquiryRoom(socket, enquiryId);
			ack?.({ success: true, data: { enquiryId } });
		} catch {
			ack?.({ success: false, message: "Failed to leave enquiry room" });
		}
	});

	socket.on(SOCKET_EVENTS.CHAT.SEND_MESSAGE, async (payload, ack) => {
		const respond = (response: AckResponse<ChatMessageRealtimePayload>) => {
			ack?.(response);
		};

		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.CHAT.SEND_MESSAGE, 120)) {
				respond({ success: false, message: "Rate limit exceeded" });
				return;
			}

			const enquiryId = payload.enquiryId?.trim();
			const content = payload.content?.trim();
			if (!enquiryId || !content) {
				respond({
					success: false,
					message: "enquiryId and content are required",
				});
				return;
			}

			const access = await canAccessEnquiry(enquiryId, userId);
			if (!access.canAccess) {
				respond({ success: false, message: "Forbidden to send message" });
				return;
			}

			const receiverId = payload.receiverId?.trim()
				? payload.receiverId.trim()
				: inferReceiverId(userId, access.enquiryUserId, access.propertyOwnerId);

			if (!receiverId) {
				respond({ success: false, message: "Unable to resolve receiverId" });
				return;
			}

			if (receiverId === userId) {
				respond({ success: false, message: "receiverId cannot be the sender" });
				return;
			}

			const created = await db.message.create({
				data: {
					enquiryId,
					senderId: userId,
					receiverId,
					content,
				},
			});

			const messagePayload = toMessagePayload(created);
			emitChatMessage(messagePayload);
			respond({ success: true, data: messagePayload });
		} catch {
			respond({ success: false, message: "Failed to send message" });
		}
	});
};
