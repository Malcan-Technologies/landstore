import type { Request, Response } from "express";
import {
	createEnquiryRole,
	deleteEnquiryRole,
	getEnquiryRoleById,
	getEnquiryRoles,
	updateEnquiryRole,
} from "../services/enquiryRole.js";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
	};
};

const getEnquiryRoleIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid enquiry role id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

const toNumberOrUndefined = (value: unknown): number | undefined => {
	if (value === undefined || value === null || value === "") return undefined;

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
};

export const createEnquiryRoleController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { enquiryId, roleId } = req.body;

		const created = await createEnquiryRole({ enquiryId, roleId });

		res.status(201).json({
			success: true,
			message: "Enquiry role created successfully",
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

export const getEnquiryRolesController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const query: { enquiryId?: string; roleId?: string; page?: number; limit?: number } = {};
		const enquiryId = req.query.enquiryId as string | undefined;
		const roleId = req.query.roleId as string | undefined;
		const page = toNumberOrUndefined(req.query.page);
		const limit = toNumberOrUndefined(req.query.limit);

		if (typeof enquiryId === "string" && enquiryId.trim()) {
			query.enquiryId = enquiryId.trim();
		}

		if (typeof roleId === "string" && roleId.trim()) {
			query.roleId = roleId.trim();
		}

		if (page !== undefined) {
			query.page = page;
		}

		if (limit !== undefined) {
			query.limit = limit;
		}

		const result = await getEnquiryRoles(query);

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

export const getEnquiryRoleByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const enquiryRoleId = getEnquiryRoleIdParamOrThrow(req);
		const enquiryRole = await getEnquiryRoleById(enquiryRoleId);

		res.status(200).json({
			success: true,
			data: enquiryRole,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const updateEnquiryRoleController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const enquiryRoleId = getEnquiryRoleIdParamOrThrow(req);
		const { enquiryId, roleId } = req.body;

		const updated = await updateEnquiryRole(enquiryRoleId, { enquiryId, roleId });

		res.status(200).json({
			success: true,
			message: "Enquiry role updated successfully",
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

export const deleteEnquiryRoleController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const enquiryRoleId = getEnquiryRoleIdParamOrThrow(req);
		const result = await deleteEnquiryRole(enquiryRoleId);

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
