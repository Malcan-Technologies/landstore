import type { Request, Response } from "express";
import { getRequesterUserFromToken } from "../services/user.ts";
import {
	createUtilization,
	getAllUtilizations,
	getUtilizationById,
	updateUtilization,
	deleteUtilization,
} from "../services/utilization.ts";

const getTokenFromRequest = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
	return (req.cookies as Record<string, string>)?.["__session"] ?? null;
};

const getRequesterUserOrThrow = async (req: Request) => {
	const token = getTokenFromRequest(req);
	if (!token) {
		const unauthorizedError = new Error("Unauthorized");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return getRequesterUserFromToken(token);
};

/**
 * Create a new utilization
 */
export const createUtilizationController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const { name } = req.body;

		const result = await createUtilization(name);

		res.status(201).json({
			success: true,
			message: "Utilization created successfully",
			data: result,
		});
	} catch (error: any) {
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to create utilization",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to retrieve utilizations",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to retrieve utilization",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to update utilization",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to delete utilization",
		});
	}
};
