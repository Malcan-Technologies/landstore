import type { Request, Response } from "express";
import {
	createMessage,
	deleteMessage,
	getMessageById,
	listMessagesByEnquiry,
	updateMessage,
} from "../services/message.js";

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
	const user = (req as any).user as
		| { id?: string; userType?: string }
		| undefined;

	if (!user?.id) {
		const unauthorizedError = new Error(
			"Authentication required. Please log in to access this resource."
		);
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return {
		id: user.id,
		userType: user.userType,
	};
};

const toPositiveNumberOrUndefined = (value: unknown): number | undefined => {
	if (value === undefined || value === null || value === "") return undefined;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
	return parsed;
};

export const createMessageController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const { enquiryId, content, receiverId } = req.body;

		const created = await createMessage(requester, {
			enquiryId,
			content,
			receiverId,
		});

		res.status(201).json({
			success: true,
			message: "Message created successfully",
			data: created,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const listMessagesByEnquiryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const enquiryId = req.params.enquiryId as string;
		const page = toPositiveNumberOrUndefined(req.query.page);
		const limit = toPositiveNumberOrUndefined(req.query.limit);
		const query: { page?: number; limit?: number } = {};
		if (page !== undefined) query.page = page;
		if (limit !== undefined) query.limit = limit;

		const result = await listMessagesByEnquiry(requester, enquiryId, query);

		res.status(200).json({
			success: true,
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const getMessageByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const messageId = req.params.id as string;

		const messageData = await getMessageById(requester, messageId);

		res.status(200).json({
			success: true,
			data: messageData,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const updateMessageController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const messageId = req.params.id as string;
		const { content, receiverId } = req.body;

		const updated = await updateMessage(requester, messageId, {
			content,
			receiverId,
		});

		res.status(200).json({
			success: true,
			message: "Message updated successfully",
			data: updated,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const deleteMessageController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const messageId = req.params.id as string;

		const result = await deleteMessage(requester, messageId);

		res.status(200).json({
			success: true,
			message: result.message,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};
