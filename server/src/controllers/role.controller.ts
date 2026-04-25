import type { Request, Response } from "express";
import {
	createRole,
	deleteRole,
	getRoleById,
	getRoles,
	updateRole,
} from "../services/role.js";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
	};
};

const getRoleIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid role id");
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

export const createRoleController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { name } = req.body;
		const created = await createRole({ name });

		res.status(201).json({
			success: true,
			message: "Role created successfully",
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

export const getRolesController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const query: { name?: string; page?: number; limit?: number } = {};
		const name = req.query.name as string | undefined;
		const page = toNumberOrUndefined(req.query.page);
		const limit = toNumberOrUndefined(req.query.limit);

		if (typeof name === "string" && name.trim()) {
			query.name = name.trim();
		}

		if (page !== undefined) {
			query.page = page;
		}

		if (limit !== undefined) {
			query.limit = limit;
		}

		const result = await getRoles(query);

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

export const getRoleByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const roleId = getRoleIdParamOrThrow(req);
		const role = await getRoleById(roleId);

		res.status(200).json({
			success: true,
			data: role,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

export const updateRoleController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const roleId = getRoleIdParamOrThrow(req);
		const { name } = req.body;
		const updated = await updateRole(roleId, { name });

		res.status(200).json({
			success: true,
			message: "Role updated successfully",
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

export const deleteRoleController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const roleId = getRoleIdParamOrThrow(req);
		const result = await deleteRole(roleId);

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
