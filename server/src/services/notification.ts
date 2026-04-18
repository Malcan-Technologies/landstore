import db from "../../config/prisma.js";
import type { NotificationType } from "@prisma/client";
import {
	emitNotificationCreated,
	emitNotificationDeleted,
	emitNotificationUpdated,
	emitUnreadNotificationCount,
} from "../socket/emitters/notification.emitter.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

const validNotificationTypes: readonly NotificationType[] = ["welcome", "urgent"];

const toRealtimePayload = (notification: {
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

export type CreateNotificationPayload = {
	userId: string;
	type: NotificationType;
	content: string;
	isRead?: boolean;
};

export type UpdateNotificationPayload = {
	type?: NotificationType | undefined;
	content?: string | undefined;
	isRead?: boolean | undefined;
};

type GetNotificationsQuery = {
	userId?: string | undefined;
	type?: NotificationType | undefined;
	isRead?: boolean | undefined;
	page?: number | undefined;
	limit?: number | undefined;
};

const includeNotificationRelations = {
	user: {
		select: {
			id: true,
			email: true,
			userType: true,
		},
	},
} as const;

/**
 * Create a new notification
 */
export const createNotification = async (payload: CreateNotificationPayload) => {
	try {
		// Validate required fields
		const requiredFields: Array<keyof CreateNotificationPayload> = [
			"userId",
			"type",
			"content",
		];

		for (const field of requiredFields) {
			const value = payload[field];
			if (field === "userId" || field === "content") {
				if (typeof value !== "string" || !value.trim()) {
					throw createHttpError(`${field} is required`, 400);
				}
			}
		}

		// Validate notification type
		if (!validNotificationTypes.includes(payload.type)) {
			throw createHttpError(
				`Invalid notification type. Must be one of: ${validNotificationTypes.join(", ")}`,
				400
			);
		}

		// Verify user exists
		const userExists = await db.user.findUnique({
			where: { id: payload.userId },
			select: { id: true },
		});

		if (!userExists) {
			throw createHttpError("User not found", 404);
		}

		const notification = await db.notification.create({
			data: {
				userId: payload.userId,
				type: payload.type,
				content: payload.content.trim(),
				isRead: payload.isRead ?? false,
			},
			include: includeNotificationRelations,
		});

		const unreadCount = await db.notification.count({
			where: {
				userId: notification.userId,
				isRead: false,
			},
		});

		emitNotificationCreated(toRealtimePayload(notification));
		emitUnreadNotificationCount(notification.userId, unreadCount);

		return {
			id: notification.id,
			userId: notification.userId,
			type: notification.type,
			content: notification.content,
			isRead: notification.isRead,
			user: notification.user,
			createdAt: notification.createdAt,
			updatedAt: notification.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all notifications with optional filters and pagination
 */
export const getNotifications = async (query: GetNotificationsQuery) => {
	try {
		const pageSize = query.limit ?? 10;
		const pageNumber = query.page ?? 1;
		const skip = (pageNumber - 1) * pageSize;

		const where: Record<string, any> = {};

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.type) {
			where.type = query.type;
		}

		if (query.isRead !== undefined) {
			where.isRead = query.isRead;
		}

		const [notifications, total] = await Promise.all([
			db.notification.findMany({
				where,
				include: includeNotificationRelations,
				skip,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.notification.count({ where }),
		]);

		return {
			data: notifications.map((notification: any) => ({
				id: notification.id,
				userId: notification.userId,
				type: notification.type,
				content: notification.content,
				isRead: notification.isRead,
				user: notification.user,
				createdAt: notification.createdAt,
				updatedAt: notification.updatedAt,
			})),
			pagination: {
				page: pageNumber,
				pageSize,
				total,
				pages: Math.ceil(total / pageSize),
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single notification by ID
 */
export const getNotificationById = async (notificationId: string) => {
	if (!notificationId || notificationId.trim().length === 0) {
		throw createHttpError("Notification ID is required", 400);
	}

	try {
		const notification = await db.notification.findUnique({
			where: { id: notificationId },
			include: includeNotificationRelations,
		});

		if (!notification) {
			throw createHttpError("Notification not found", 404);
		}

		return {
			id: notification.id,
			userId: notification.userId,
			type: notification.type,
			content: notification.content,
			isRead: notification.isRead,
			user: notification.user,
			createdAt: notification.createdAt,
			updatedAt: notification.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all notifications for a specific user
 */
export const getNotificationsByUserId = async (
	userId: string,
	page?: number,
	limit?: number
) => {
	if (!userId || userId.trim().length === 0) {
		throw createHttpError("User ID is required", 400);
	}

	try {
		// Verify user exists
		const userExists = await db.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			throw createHttpError("User not found", 404);
		}

		const pageSize = limit ?? 10;
		const pageNumber = page ?? 1;
		const skip = (pageNumber - 1) * pageSize;

		const [notifications, total] = await Promise.all([
			db.notification.findMany({
				where: { userId },
				include: includeNotificationRelations,
				skip,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.notification.count({ where: { userId } }),
		]);

		return {
			data: notifications.map((notification: any) => ({
				id: notification.id,
				userId: notification.userId,
				type: notification.type,
				content: notification.content,
				isRead: notification.isRead,
				createdAt: notification.createdAt,
				updatedAt: notification.updatedAt,
			})),
			pagination: {
				page: pageNumber,
				pageSize,
				total,
				pages: Math.ceil(total / pageSize),
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get unread notifications count for a user
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
	if (!userId || userId.trim().length === 0) {
		throw createHttpError("User ID is required", 400);
	}

	try {
		const count = await db.notification.count({
			where: {
				userId,
				isRead: false,
			},
		});

		return count;
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update notification details
 */
export const updateNotification = async (
	notificationId: string,
	payload: UpdateNotificationPayload
) => {
	if (!notificationId || notificationId.trim().length === 0) {
		throw createHttpError("Notification ID is required", 400);
	}

	// Validate that at least one field is being updated
	const hasUpdate = Object.values(payload).some((value) => value !== undefined);

	if (!hasUpdate) {
		throw createHttpError("At least one field must be updated", 400);
	}

	try {
		// Verify notification exists
		const notification = await db.notification.findUnique({
			where: { id: notificationId },
		});

		if (!notification) {
			throw createHttpError("Notification not found", 404);
		}

		const updateData: Record<string, any> = {};

		if (payload.type !== undefined) {
			// Validate notification type
			if (!validNotificationTypes.includes(payload.type)) {
				throw createHttpError(
					`Invalid notification type. Must be one of: ${validNotificationTypes.join(", ")}`,
					400
				);
			}
			updateData.type = payload.type;
		}

		if (payload.content !== undefined) {
			updateData.content = payload.content.trim();
		}

		if (payload.isRead !== undefined) {
			updateData.isRead = payload.isRead;
		}

		const updatedNotification = await db.notification.update({
			where: { id: notificationId },
			data: updateData,
			include: includeNotificationRelations,
		});

		const unreadCount = await db.notification.count({
			where: {
				userId: updatedNotification.userId,
				isRead: false,
			},
		});

		emitNotificationUpdated(toRealtimePayload(updatedNotification));
		emitUnreadNotificationCount(updatedNotification.userId, unreadCount);

		return {
			id: updatedNotification.id,
			userId: updatedNotification.userId,
			type: updatedNotification.type,
			content: updatedNotification.content,
			isRead: updatedNotification.isRead,
			user: updatedNotification.user,
			createdAt: updatedNotification.createdAt,
			updatedAt: updatedNotification.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
	if (!notificationId || notificationId.trim().length === 0) {
		throw createHttpError("Notification ID is required", 400);
	}

	try {
		// Verify notification exists
		const notification = await db.notification.findUnique({
			where: { id: notificationId },
		});

		if (!notification) {
			throw createHttpError("Notification not found", 404);
		}

		const updated = await db.notification.update({
			where: { id: notificationId },
			data: {
				isRead: true,
			},
		});

		const unreadCount = await db.notification.count({
			where: {
				userId: updated.userId,
				isRead: false,
			},
		});

		emitNotificationUpdated(toRealtimePayload(updated));
		emitUnreadNotificationCount(updated.userId, unreadCount);
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<number> => {
	if (!userId || userId.trim().length === 0) {
		throw createHttpError("User ID is required", 400);
	}

	try {
		// Verify user exists
		const userExists = await db.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			throw createHttpError("User not found", 404);
		}

		const result = await db.notification.updateMany({
			where: {
				userId,
				isRead: false,
			},
			data: {
				isRead: true,
			},
		});

		const unreadCount = await db.notification.count({
			where: {
				userId,
				isRead: false,
			},
		});

		emitUnreadNotificationCount(userId, unreadCount);

		return result.count;
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
	if (!notificationId || notificationId.trim().length === 0) {
		throw createHttpError("Notification ID is required", 400);
	}

	try {
		// Verify notification exists
		const notification = await db.notification.findUnique({
			where: { id: notificationId },
		});

		if (!notification) {
			throw createHttpError("Notification not found", 404);
		}

		const deleted = await db.notification.delete({
			where: { id: notificationId },
		});

		const unreadCount = await db.notification.count({
			where: {
				userId: deleted.userId,
				isRead: false,
			},
		});

		emitNotificationDeleted(deleted.userId, deleted.id);
		emitUnreadNotificationCount(deleted.userId, unreadCount);
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete all notifications for a user
 */
export const deleteAllNotificationsByUserId = async (userId: string): Promise<number> => {
	if (!userId || userId.trim().length === 0) {
		throw createHttpError("User ID is required", 400);
	}

	try {
		// Verify user exists
		const userExists = await db.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			throw createHttpError("User not found", 404);
		}

		const result = await db.notification.deleteMany({
			where: { userId },
		});

		emitUnreadNotificationCount(userId, 0);

		return result.count;
	} catch (error: unknown) {
		throw error;
	}
};
