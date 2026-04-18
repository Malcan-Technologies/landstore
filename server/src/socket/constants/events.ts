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
		NEW_MESSAGE: "chat:new-message",
		HISTORY: "chat:history",
	},
} as const;

export const ROOM_PREFIX = {
	USER: "user",
	ENQUIRY: "enquiry",
} as const;
