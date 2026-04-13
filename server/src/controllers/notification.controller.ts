import type { Request, Response } from "express";
import {
	createNotification,
	getNotifications,
	getNotificationById,
	getNotificationsByUserId,
	getUnreadNotificationCount,
	updateNotification,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	deleteAllNotificationsByUserId,
} from "../services/notification.js";
import { NotificationType } from "@prisma/client";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
	};
};

const getRequesterUserOrThrow = (req: Request) => {
	// Middleware already validated session and attached user
	const user = (req as any).user;
	if (!user) {
		const unauthorizedError = new Error("Authentication required. Please log in to access this resource.");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return user;
};

const getNotificationIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid notification id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create a new notification
 * POST /api/notifications
 * Body: { userId, type, content, isRead? }
 */
export const createNotificationController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const { userId, type, content, isRead } = req.body;

		if (!userId || !type || !content) {
			const badRequestError = new Error("userId, type, and content are required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		// Validate that type is a valid NotificationType enum value
		const validTypes: NotificationType[] = ["welcome", "urgent"];
		if (!validTypes.includes(type)) {
			const badRequestError = new Error(
				`Invalid notification type. Must be one of: ${validTypes.join(", ")}`
			);
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const notification = await createNotification({
			userId,
			type: type as NotificationType,
			content,
			isRead,
		});

		res.status(201).json({
			success: true,
			message: "Notification created successfully",
			data: notification,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Get all notifications with optional filters
 * GET /api/notifications?userId=...&type=...&isRead=...&page=1&limit=10
 */
export const getNotificationsController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const userId =
			typeof req.query.userId === "string" ? req.query.userId : undefined;
		const typeParam = typeof req.query.type === "string" ? req.query.type : undefined;
		const isRead = req.query.isRead
			? req.query.isRead === "true"
			: undefined;
		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;

		// Validate type if provided
		let type: NotificationType | undefined;
		if (typeParam) {
			const validTypes: NotificationType[] = ["welcome", "urgent"];
			if (!validTypes.includes(typeParam as NotificationType)) {
				const badRequestError = new Error(
					`Invalid notification type. Must be one of: ${validTypes.join(", ")}`
				);
				(badRequestError as Error & { statusCode?: number }).statusCode = 400;
				throw badRequestError;
			}
			type = typeParam as NotificationType;
		}

		const result = await getNotifications({
			userId,
			type,
			isRead,
			page,
			limit,
		});

		res.status(200).json({
			success: true,
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Get a single notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const notificationId = getNotificationIdParamOrThrow(req);

		const notification = await getNotificationById(notificationId);

		res.status(200).json({
			success: true,
			data: notification,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Get all notifications for a specific user
 * GET /api/notifications/user/:userId?page=1&limit=10
 */
export const getNotificationsByUserIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const userId = req.params.userId as string;
		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;

		const result = await getNotificationsByUserId(userId, page, limit);

		res.status(200).json({
			success: true,
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Get unread notification count for a user
 * GET /api/notifications/user/:userId/unread-count
 */
export const getUnreadNotificationCountController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const userId = req.params.userId as string;

		const count = await getUnreadNotificationCount(userId);

		res.status(200).json({
			success: true,
			data: { unreadCount: count },
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Update notification details
 * PATCH /api/notifications/:id
 * Body: { type?, content?, isRead? }
 */
export const updateNotificationController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const notificationId = getNotificationIdParamOrThrow(req);

		const { type, content, isRead } = req.body;

		// Validate type if provided
		let validatedType: NotificationType | undefined;
		if (type !== undefined) {
			const validTypes: NotificationType[] = ["welcome", "urgent"];
			if (!validTypes.includes(type)) {
				const badRequestError = new Error(
					`Invalid notification type. Must be one of: ${validTypes.join(", ")}`
				);
				(badRequestError as Error & { statusCode?: number }).statusCode = 400;
				throw badRequestError;
			}
			validatedType = type as NotificationType;
		}

		const updatedNotification = await updateNotification(notificationId, {
			type: validatedType,
			content,
			isRead,
		});

		res.status(200).json({
			success: true,
			message: "Notification updated successfully",
			data: updatedNotification,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/mark-as-read
 */
export const markAsReadController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const notificationId = getNotificationIdParamOrThrow(req);

		await markAsRead(notificationId);

		res.status(200).json({
			success: true,
			message: "Notification marked as read",
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Mark all notifications as read for a user
 * PATCH /api/notifications/user/:userId/mark-all-as-read
 */
export const markAllAsReadController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const userId = req.params.userId as string;

		const count = await markAllAsRead(userId);

		res.status(200).json({
			success: true,
			message: `${count} notifications marked as read`,
			data: { markedCount: count },
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotificationController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const notificationId = getNotificationIdParamOrThrow(req);

		await deleteNotification(notificationId);

		res.status(200).json({
			success: true,
			message: "Notification deleted successfully",
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Delete all notifications for a user
 * DELETE /api/notifications/user/:userId/all
 */
export const deleteAllNotificationsByUserIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const userId = req.params.userId as string;

		const count = await deleteAllNotificationsByUserId(userId);

		res.status(200).json({
			success: true,
			message: `${count} notifications deleted`,
			data: { deletedCount: count },
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};
