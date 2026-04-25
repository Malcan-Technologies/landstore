import { SOCKET_EVENTS } from "../constants/events.js";
import { isSocketEventAllowed } from "../middleware/rateLimit.middleware.js";
import {
	getEnquiryRoomName,
	joinEnquiryRoom,
	leaveEnquiryRoom,
} from "../rooms/room.manager.js";
import {
	canAccessEnquiryMessages,
	createMessage,
	deleteMessage,
	getEnquiryMessageHistoryForSocket,
	updateMessage,
} from "../../services/message.js";
import type {
	AckResponse,
	AppSocket,
	ChatMessageRealtimePayload,
} from "../types/socket.types.js";

export const registerChatHandler = (socket: AppSocket): void => {
	const userId = socket.data.user?.id;
	if (!userId) return;
	const requester = {
		id: userId,
		userType: socket.data.user?.userType,
	};

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

			await canAccessEnquiryMessages(requester, enquiryId);

			await joinEnquiryRoom(socket, enquiryId);
			const messages = await getEnquiryMessageHistoryForSocket(requester, enquiryId, 100);

			socket.emit(SOCKET_EVENTS.CHAT.HISTORY, {
				enquiryId,
				messages,
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

			const created = await createMessage(requester, {
				enquiryId,
				content,
				receiverId: payload.receiverId,
			});

			respond({
				success: true,
				data: {
					id: created.id,
					enquiryId: created.enquiryId,
					senderId: created.senderId,
					receiverId: created.receiverId,
					content: created.content,
					createdAt: created.createdAt.toISOString(),
				},
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Failed to send message";
			respond({ success: false, message });
		}
	});

	socket.on(SOCKET_EVENTS.CHAT.UPDATE_MESSAGE, async (payload, ack) => {
		const respond = (response: AckResponse<ChatMessageRealtimePayload>) => {
			ack?.(response);
		};

		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.CHAT.UPDATE_MESSAGE, 60)) {
				respond({ success: false, message: "Rate limit exceeded" });
				return;
			}

			const messageId = payload.messageId?.trim();
			if (!messageId) {
				respond({ success: false, message: "messageId is required" });
				return;
			}

			const updated = await updateMessage(requester, messageId, {
				content: payload.content,
				receiverId: payload.receiverId,
			});

			respond({
				success: true,
				data: {
					id: updated.id,
					enquiryId: updated.enquiryId,
					senderId: updated.senderId,
					receiverId: updated.receiverId,
					content: updated.content,
					createdAt: updated.createdAt.toISOString(),
				},
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Failed to update message";
			respond({ success: false, message });
		}
	});

	socket.on(SOCKET_EVENTS.CHAT.DELETE_MESSAGE, async (payload, ack) => {
		const respond = (response: AckResponse<{ id: string; enquiryId: string }>) => {
			ack?.(response);
		};

		try {
			if (!isSocketEventAllowed(socket, SOCKET_EVENTS.CHAT.DELETE_MESSAGE, 60)) {
				respond({ success: false, message: "Rate limit exceeded" });
				return;
			}

			const messageId = payload.messageId?.trim();
			if (!messageId) {
				respond({ success: false, message: "messageId is required" });
				return;
			}

			const messageRecord = await deleteMessage(requester, messageId);

			respond({
				success: true,
				data: {
					id: messageRecord.id,
					enquiryId: messageRecord.enquiryId,
				},
				message: messageRecord.message,
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Failed to delete message";
			respond({ success: false, message });
		}
	});
};
