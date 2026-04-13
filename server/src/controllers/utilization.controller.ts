import type { Request, Response } from "express";
import {
	createUtilization,
	getAllUtilizations,
	getUtilizationById,
	updateUtilization,
	deleteUtilization,
} from "../services/utilization.js";

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

/**
 * Create a new utilization
 */
export const createUtilizationController = async (
	req: Request,
	res: Response
) => {
	try {

		const { name } = req.body;

		const result = await createUtilization(name);

		res.status(201).json({
			success: true,
			message: "Utilization created successfully",
			data: result,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Get all utilizations
 */
export const getAllUtilizationsController = async (
	req: Request,
	res: Response
) => {
	try {
		const utilizations = await getAllUtilizations();

		res.status(200).json({
			success: true,
			message: "Utilizations retrieved successfully",
			data: utilizations,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Get a single utilization by ID
 */
export const getUtilizationByIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const utilId = req.params.utilId as string;

		const utilization = await getUtilizationById(utilId);

		res.status(200).json({
			success: true,
			message: "Utilization retrieved successfully",
			data: utilization,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Update a utilization
 */
export const updateUtilizationController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const utilId = req.params.utilId as string;
		const { name } = req.body;

		const result = await updateUtilization(utilId, name);

		res.status(200).json({
			success: true,
			message: "Utilization updated successfully",
			data: result,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Delete a utilization
 */
export const deleteUtilizationController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const utilId = req.params.utilId as string;

		await deleteUtilization(utilId);

		res.status(200).json({
			success: true,
			message: "Utilization deleted successfully",
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};
