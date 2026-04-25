import type { Socket, Server } from "socket.io";

export type AckResponse<T = unknown> = {
	success: boolean;
	message?: string;
	data?: T;
};

export type SocketUser = {
	id: string;
	email?: string;
	userType?: string;
};

export type NotificationRealtimePayload = {
	id: string;
	userId: string;
	type: string;
	content: string;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ChatMessageRealtimePayload = {
	id: string;
	enquiryId: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
};

export type ChatMessageDeletedRealtimePayload = {
	id: string;
	enquiryId: string;
	senderId: string;
	receiverId: string;
	deletedAt: string;
};

export interface ClientToServerEvents {
	"notification:subscribe": (ack?: (response: AckResponse) => void) => void;
	"notification:unsubscribe": (ack?: (response: AckResponse) => void) => void;
	"notification:mark-read": (
		payload: { notificationId: string },
		ack?: (response: AckResponse) => void
	) => void;
	"notification:mark-all-read": (ack?: (response: AckResponse) => void) => void;
	"chat:join-enquiry": (
		payload: { enquiryId: string },
		ack?: (response: AckResponse) => void
	) => void;
	"chat:leave-enquiry": (
		payload: { enquiryId: string },
		ack?: (response: AckResponse) => void
	) => void;
	"chat:send-message": (
		payload: { enquiryId: string; receiverId?: string; content: string },
		ack?: (response: AckResponse<ChatMessageRealtimePayload>) => void
	) => void;
	"chat:update-message": (
		payload: { messageId: string; content?: string; receiverId?: string },
		ack?: (response: AckResponse<ChatMessageRealtimePayload>) => void
	) => void;
	"chat:delete-message": (
		payload: { messageId: string },
		ack?: (response: AckResponse<{ id: string; enquiryId: string }>) => void
	) => void;
}

export interface ServerToClientEvents {
	"system:error": (payload: { message: string }) => void;
	"user:connected": (payload: { userId: string }) => void;
	"user:disconnected": (payload: { userId: string }) => void;
	"notification:created": (payload: NotificationRealtimePayload) => void;
	"notification:updated": (payload: NotificationRealtimePayload) => void;
	"notification:deleted": (payload: { id: string; userId: string }) => void;
	"notification:unread-count": (payload: { userId: string; unreadCount: number }) => void;
	"chat:new-message": (payload: ChatMessageRealtimePayload) => void;
	"chat:message-updated": (payload: ChatMessageRealtimePayload) => void;
	"chat:message-deleted": (payload: ChatMessageDeletedRealtimePayload) => void;
	"chat:history": (payload: { enquiryId: string; messages: ChatMessageRealtimePayload[] }) => void;
}

export interface InterServerEvents {}

export type SocketData = {
	user?: SocketUser;
};

export type AppSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export type AppServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;
