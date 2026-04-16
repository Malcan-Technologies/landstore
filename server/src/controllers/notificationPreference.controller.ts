/**
 * NOTIFICATION PREFERENCE CONTROLLER
 * 
 * Manages user notification preferences (email, push notifications)
 */

import type { Request, Response } from "express";
import {
  createNotificationPreference,
  getNotificationPreference,
  getNotificationPreferenceById,
  updateNotificationPreference,
  deleteNotificationPreference,
  getAllNotificationPreferences,
} from "../services/notificationPreference.js";

const getErrorPayload = (error: unknown) => {
  const err = error as
    | { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
    | undefined;

  return {
    statusCode: err?.statusCode ?? 500,
    message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
  };
};

/**
 * CREATE NOTIFICATION PREFERENCE
 * POST /api/notification-preferences
 * Body: { emailEnabled?: boolean, pushEnabled?: boolean }
 * 
 * Creates notification preferences for authenticated user
 */
export const createNotificationPreferenceController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { emailEnabled, pushEnabled } = req.body;

    const notificationPreference = await createNotificationPreference(user.id, {
      emailEnabled,
      pushEnabled,
    });

    return res.status(201).json({
      success: true,
      message: "Notification preference created successfully",
      result: notificationPreference,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * GET MY NOTIFICATION PREFERENCE
 * GET /api/notification-preferences/me
 * 
 * Gets notification preferences for authenticated user
 */
export const getMyNotificationPreferenceController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const notificationPreference = await getNotificationPreference(user.id);

    return res.status(200).json({
      success: true,
      message: "Notification preference retrieved successfully",
      result: notificationPreference,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * GET NOTIFICATION PREFERENCE BY ID
 * GET /api/notification-preferences/:id
 * 
 * Gets notification preference by ID (admin only)
 */
export const getNotificationPreferenceByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    if (!user || user.userType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid ID is required",
      });
    }

    const notificationPreference = await getNotificationPreferenceById(id);

    return res.status(200).json({
      success: true,
      message: "Notification preference retrieved successfully",
      result: notificationPreference,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * UPDATE MY NOTIFICATION PREFERENCE
 * PATCH /api/notification-preferences/me
 * Body: { emailEnabled?: boolean, pushEnabled?: boolean }
 * 
 * Updates notification preferences for authenticated user
 */
export const updateMyNotificationPreferenceController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { emailEnabled, pushEnabled } = req.body;

    const notificationPreference = await updateNotificationPreference(user.id, {
      emailEnabled,
      pushEnabled,
    });

    return res.status(200).json({
      success: true,
      message: "Notification preference updated successfully",
      result: notificationPreference,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * DELETE MY NOTIFICATION PREFERENCE
 * DELETE /api/notification-preferences/me
 * 
 * Deletes notification preferences for authenticated user
 */
export const deleteMyNotificationPreferenceController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await deleteNotificationPreference(user.id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * GET ALL NOTIFICATION PREFERENCES
 * GET /api/notification-preferences
 * Query: { page?: number, limit?: number }
 * 
 * Gets all notification preferences (admin only)
 */
export const getAllNotificationPreferencesController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    if (!user || user.userType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllNotificationPreferences(page, limit);

    return res.status(200).json({
      success: true,
      message: "Notification preferences retrieved successfully",
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
