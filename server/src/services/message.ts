import db from "../../config/prisma.js";
import {
	emitChatMessage,
	emitChatMessageDeleted,
	emitChatMessageUpdated,
} from "../socket/emitters/chat.emitter.js";
import type {
	ChatMessageDeletedRealtimePayload,
	ChatMessageRealtimePayload,
} from "../socket/types/socket.types.js";

type Requester = {
	id: string;
	userType?: string | null | undefined;
};

type CreateMessagePayload = {
	enquiryId: string;
	content: string;
	receiverId?: string;
};

type UpdateMessagePayload = {
	content?: string;
	receiverId?: string;
};

type MessageListQuery = {
	page?: number;
	limit?: number;
};

type EnquiryAccessContext = {
	enquiryId: string;
	enquiryUserId: string;
	propertyOwnerId: string;
	isAdmin: boolean;
};

const ADMIN_USER_TYPES = new Set(["admin", "superadmin"]);
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 30;
const MAX_MESSAGE_LENGTH = 1000;

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

const isAdminUserType = (userType?: string | null): boolean => {
	if (!userType) return false;
	return ADMIN_USER_TYPES.has(userType.toLowerCase());
};

const normalizeText = (value: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const toMessageRealtimePayload = (message: {
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

const normalizePagination = (query: MessageListQuery) => {
	const page =
		typeof query.page === "number" && Number.isFinite(query.page) && query.page > 0
			? Math.floor(query.page)
			: 1;

	const limitRaw =
		typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0
			? Math.floor(query.limit)
			: DEFAULT_PAGE_SIZE;

	const limit = Math.min(limitRaw, MAX_PAGE_SIZE);
	const skip = (page - 1) * limit;

	return { page, limit, skip };
};

const getEnquiryAccessContext = async (
	enquiryId: string,
	requester: Requester
): Promise<EnquiryAccessContext> => {
	const normalizedEnquiryId = normalizeText(enquiryId);
	if (!normalizedEnquiryId) {
		throw createHttpError("enquiryId is required", 400);
	}

	const enquiry = await db.propertyEnquiry.findUnique({
		where: { id: normalizedEnquiryId },
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
		throw createHttpError("Enquiry not found", 404);
	}

	const isAdmin = isAdminUserType(requester.userType);
	const isParticipant =
		requester.id === enquiry.userId || requester.id === enquiry.property.userId;

	if (!isAdmin && !isParticipant) {
		throw createHttpError("Forbidden to access messages for this enquiry", 403);
	}

	return {
		enquiryId: enquiry.id,
		enquiryUserId: enquiry.userId,
		propertyOwnerId: enquiry.property.userId,
		isAdmin,
	};
};

const resolveReceiverId = async (
	explicitReceiverId: string | undefined,
	senderId: string,
	context: EnquiryAccessContext
): Promise<string> => {
	const providedReceiverId = normalizeText(explicitReceiverId);

	if (providedReceiverId) {
		if (providedReceiverId === senderId) {
			throw createHttpError("receiverId cannot be the sender", 400);
		}

		if (
			providedReceiverId === context.enquiryUserId ||
			providedReceiverId === context.propertyOwnerId
		) {
			return providedReceiverId;
		}

		const receiver = await db.user.findUnique({
			where: { id: providedReceiverId },
			select: { id: true, userType: true },
		});

		if (receiver && isAdminUserType(receiver.userType)) {
			return providedReceiverId;
		}

		throw createHttpError("Invalid receiverId for this enquiry", 403);
	}

	if (context.isAdmin) {
		return context.enquiryUserId;
	}

	if (senderId === context.enquiryUserId) {
		return context.propertyOwnerId;
	}

	if (senderId === context.propertyOwnerId) {
		return context.enquiryUserId;
	}

	throw createHttpError("Unable to resolve receiverId", 400);
};

const messageInclude = {
	sender: {
		select: {
			id: true,
			email: true,
			userType: true,
		},
	},
	receiver: {
		select: {
			id: true,
			email: true,
			userType: true,
		},
	},
} as const;

export const listMessagesByEnquiry = async (
	requester: Requester,
	enquiryId: string,
	query: MessageListQuery = {}
) => {
	const context = await getEnquiryAccessContext(enquiryId, requester);
	const { page, limit, skip } = normalizePagination(query);

	const [messages, total] = await Promise.all([
		db.message.findMany({
			where: { enquiryId: context.enquiryId },
			orderBy: { createdAt: "asc" },
			skip,
			take: limit,
			include: messageInclude,
		}),
		db.message.count({
			where: { enquiryId: context.enquiryId },
		}),
	]);

	return {
		data: messages,
		pagination: {
			page,
			pageSize: limit,
			total,
			pages: Math.ceil(total / limit),
		},
	};
};

export const getMessageById = async (requester: Requester, messageId: string) => {
	const normalizedMessageId = normalizeText(messageId);
	if (!normalizedMessageId) {
		throw createHttpError("messageId is required", 400);
	}

	const message = await db.message.findUnique({
		where: { id: normalizedMessageId },
		include: messageInclude,
	});

	if (!message) {
		throw createHttpError("Message not found", 404);
	}

	await getEnquiryAccessContext(message.enquiryId, requester);
	return message;
};

export const createMessage = async (
	requester: Requester,
	payload: CreateMessagePayload
) => {
	const context = await getEnquiryAccessContext(payload.enquiryId, requester);
	const content = normalizeText(payload.content);

	if (!content) {
		throw createHttpError("content is required", 400);
	}

	if (content.length > MAX_MESSAGE_LENGTH) {
		throw createHttpError(`content exceeds ${MAX_MESSAGE_LENGTH} characters`, 400);
	}

	const receiverId = await resolveReceiverId(payload.receiverId, requester.id, context);

	const created = await db.message.create({
		data: {
			enquiryId: context.enquiryId,
			senderId: requester.id,
			receiverId,
			content,
		},
		include: messageInclude,
	});

	emitChatMessage(toMessageRealtimePayload(created));
	return created;
};

export const updateMessage = async (
	requester: Requester,
	messageId: string,
	payload: UpdateMessagePayload
) => {
	const normalizedMessageId = normalizeText(messageId);
	if (!normalizedMessageId) {
		throw createHttpError("messageId is required", 400);
	}

	const existingMessage = await db.message.findUnique({
		where: { id: normalizedMessageId },
		select: {
			id: true,
			enquiryId: true,
			senderId: true,
			receiverId: true,
			content: true,
			createdAt: true,
		},
	});

	if (!existingMessage) {
		throw createHttpError("Message not found", 404);
	}

	const context = await getEnquiryAccessContext(existingMessage.enquiryId, requester);

	if (!context.isAdmin && existingMessage.senderId !== requester.id) {
		throw createHttpError("Only the sender or admin can update this message", 403);
	}

	const nextContent =
		payload.content === undefined
			? undefined
			: normalizeText(payload.content) ?? "";

	if (nextContent !== undefined && nextContent.length === 0) {
		throw createHttpError("content cannot be empty", 400);
	}

	if (nextContent !== undefined && nextContent.length > MAX_MESSAGE_LENGTH) {
		throw createHttpError(`content exceeds ${MAX_MESSAGE_LENGTH} characters`, 400);
	}

	const nextReceiverId =
		payload.receiverId === undefined
			? undefined
			: await resolveReceiverId(payload.receiverId, existingMessage.senderId, context);

	if (nextContent === undefined && nextReceiverId === undefined) {
		throw createHttpError("No fields provided to update", 400);
	}

	const updated = await db.message.update({
		where: { id: normalizedMessageId },
		data: {
			...(nextContent !== undefined ? { content: nextContent } : {}),
			...(nextReceiverId !== undefined ? { receiverId: nextReceiverId } : {}),
		},
		include: messageInclude,
	});

	emitChatMessageUpdated(toMessageRealtimePayload(updated));
	return updated;
};

export const deleteMessage = async (requester: Requester, messageId: string) => {
	const normalizedMessageId = normalizeText(messageId);
	if (!normalizedMessageId) {
		throw createHttpError("messageId is required", 400);
	}

	const existingMessage = await db.message.findUnique({
		where: { id: normalizedMessageId },
		select: {
			id: true,
			enquiryId: true,
			senderId: true,
			receiverId: true,
		},
	});

	if (!existingMessage) {
		throw createHttpError("Message not found", 404);
	}

	const context = await getEnquiryAccessContext(existingMessage.enquiryId, requester);
	if (!context.isAdmin && existingMessage.senderId !== requester.id) {
		throw createHttpError("Only the sender or admin can delete this message", 403);
	}

	await db.message.delete({
		where: { id: normalizedMessageId },
	});

	const deletePayload: ChatMessageDeletedRealtimePayload = {
		id: existingMessage.id,
		enquiryId: existingMessage.enquiryId,
		senderId: existingMessage.senderId,
		receiverId: existingMessage.receiverId,
		deletedAt: new Date().toISOString(),
	};
	emitChatMessageDeleted(deletePayload);

	return {
		message: "Message deleted successfully",
		id: existingMessage.id,
		enquiryId: existingMessage.enquiryId,
	};
};

export const getEnquiryMessageHistoryForSocket = async (
	requester: Requester,
	enquiryId: string,
	limit: number = 100
): Promise<ChatMessageRealtimePayload[]> => {
	const context = await getEnquiryAccessContext(enquiryId, requester);

	const maxLimit = Math.min(Math.max(Math.floor(limit), 1), MAX_PAGE_SIZE);
	const messages = await db.message.findMany({
		where: { enquiryId: context.enquiryId },
		orderBy: { createdAt: "asc" },
		take: maxLimit,
	});

	return messages.map(toMessageRealtimePayload);
};

export const canAccessEnquiryMessages = async (
	requester: Requester,
	enquiryId: string
): Promise<boolean> => {
	await getEnquiryAccessContext(enquiryId, requester);
	return true;
};
