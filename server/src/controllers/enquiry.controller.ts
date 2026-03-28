import type { Request, Response } from "express";
import {
	createEnquiry,
	getEnquiries,
	getEnquiryById,
	getEnquiriesByPropertyId,
	getEnquiriesByUserId,
	updateEnquiry,
	deleteEnquiry,
	updateEnquiryStatus,
} from "../services/enquiry.ts";

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
		const unauthorizedError = new Error("Unauthorized");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return user;
};

const getEnquiryIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid enquiry id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create a new property enquiry
 * POST /api/enquiries
 * Body: { propertyId, userId, interestTypeId, message?, budget?, timeline?, status? }
 */
export const createEnquiryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const { propertyId, userId, interestTypeId, message, budget, timeline, status } =
			req.body;

		if (!propertyId || !userId || !interestTypeId) {
			const badRequestError = new Error(
				"propertyId, userId, and interestTypeId are required"
			);
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const enquiry = await createEnquiry({
			propertyId,
			userId,
			interestTypeId,
			message,
			budget,
			timeline,
			status,
		});

		res.status(201).json({
			success: true,
			message: "Enquiry created successfully",
			data: enquiry,
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
 * Get all enquiries with optional filters
 * GET /api/enquiries?propertyId=...&userId=...&status=...&page=1&limit=10
 */
export const getEnquiriesController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const propertyId =
			typeof req.query.propertyId === "string" ? req.query.propertyId : undefined;
		const userId =
			typeof req.query.userId === "string" ? req.query.userId : undefined;
		const status =
			typeof req.query.status === "string" ? req.query.status : undefined;
		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;

		const result = await getEnquiries({
			propertyId,
			userId,
			status,
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
 * Get a single enquiry by ID
 * GET /api/enquiries/:id
 */
export const getEnquiryByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const enquiryId = getEnquiryIdParamOrThrow(req);

		const enquiry = await getEnquiryById(enquiryId);

		res.status(200).json({
			success: true,
			data: enquiry,
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
 * Get all enquiries for a specific property
 * GET /api/enquiries/property/:propertyId?page=1&limit=10
 */
export const getEnquiriesByPropertyIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const propertyId = req.params.propertyId as string;
		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;

		const result = await getEnquiriesByPropertyId(propertyId, page, limit);

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
 * Get all enquiries by a specific user
 * GET /api/enquiries/user/:userId?page=1&limit=10
 */
export const getEnquiriesByUserIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const userId = req.params.userId as string;
		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;

		const result = await getEnquiriesByUserId(userId, page, limit);

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
 * Update enquiry details
 * PATCH /api/enquiries/:id
 * Body: { message?, budget?, timeline?, status? }
 */
export const updateEnquiryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const enquiryId = getEnquiryIdParamOrThrow(req);

		const { message, budget, timeline, status } = req.body;

		const updatedEnquiry = await updateEnquiry(enquiryId, {
			message,
			budget,
			timeline,
			status,
		});

		res.status(200).json({
			success: true,
			message: "Enquiry updated successfully",
			data: updatedEnquiry,
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
 * Update enquiry status only
 * PATCH /api/enquiries/:id/status
 * Body: { status }
 */
export const updateEnquiryStatusController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		getRequesterUserOrThrow(req);

		const enquiryId = getEnquiryIdParamOrThrow(req);
		const { status } = req.body;

		if (!status) {
			const badRequestError = new Error("Status is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		await updateEnquiryStatus(enquiryId, status);

		res.status(200).json({
			success: true,
			message: "Enquiry status updated successfully",
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
 * Delete an enquiry
 * DELETE /api/enquiries/:id
 */
export const deleteEnquiryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admin/owner later if needed)
		getRequesterUserOrThrow(req);

		const enquiryId = getEnquiryIdParamOrThrow(req);

		await deleteEnquiry(enquiryId);

		res.status(200).json({
			success: true,
			message: "Enquiry deleted successfully",
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};
