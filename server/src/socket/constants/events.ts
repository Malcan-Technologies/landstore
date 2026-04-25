export const SOCKET_EVENTS = {
	SYSTEM: {
		ERROR: "system:error",
	},
	USER: {
		CONNECTED: "user:connected",
		DISCONNECTED: "user:disconnected",
	},
	NOTIFICATION: {
		SUBSCRIBE: "notification:subscribe",
		UNSUBSCRIBE: "notification:unsubscribe",
		CREATED: "notification:created",
		UPDATED: "notification:updated",
		DELETED: "notification:deleted",
		MARK_READ: "notification:mark-read",
		MARK_ALL_READ: "notification:mark-all-read",
		UNREAD_COUNT: "notification:unread-count",
	},
	CHAT: {
		JOIN_ENQUIRY: "chat:join-enquiry",
		LEAVE_ENQUIRY: "chat:leave-enquiry",
		SEND_MESSAGE: "chat:send-message",
		UPDATE_MESSAGE: "chat:update-message",
		DELETE_MESSAGE: "chat:delete-message",
		NEW_MESSAGE: "chat:new-message",
		UPDATED_MESSAGE: "chat:message-updated",
		DELETED_MESSAGE: "chat:message-deleted",
		HISTORY: "chat:history",
	},
} as const;

export const ROOM_PREFIX = {
	USER: "user",
	ENQUIRY: "enquiry",
	ADMIN: "admin",
} as const;
