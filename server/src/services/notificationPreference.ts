import db from "../../config/prisma.js";

type UpdateNotificationPreferencePayload = {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
};

/**
 * Create notification preferences for a user
 * Each user can only have one notification preference record
 */
export const createNotificationPreference = async (
  userId: string,
  payload: UpdateNotificationPreferencePayload
) => {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const notFoundError = new Error("User not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    // Check if notification preference already exists
    const existingPrefs = await db.notificationPreference.findUnique({
      where: { userId },
    });

    if (existingPrefs) {
      const conflictError = new Error("Notification preference already exists for this user");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    // Create notification preference
    const notificationPreference = await db.notificationPreference.create({
      data: {
        userId,
        emailEnabled: payload.emailEnabled ?? true,
        pushEnabled: payload.pushEnabled ?? true,
      },
    });

    return notificationPreference;
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;
    
    const createError = new Error("Failed to create notification preference");
    (createError as Error & { statusCode?: number }).statusCode = 400;
    throw createError;
  }
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreference = async (userId: string) => {
  try {
    const notificationPreference = await db.notificationPreference.findUnique({
      where: { userId },
    });

    if (!notificationPreference) {
      const notFoundError = new Error("Notification preference not found for this user");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    return notificationPreference;
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;
    
    const getError = new Error("Failed to fetch notification preference");
    (getError as Error & { statusCode?: number }).statusCode = 400;
    throw getError;
  }
};

/**
 * Get notification preference by ID
 */
export const getNotificationPreferenceById = async (id: string) => {
  try {
    const notificationPreference = await db.notificationPreference.findUnique({
      where: { id },
    });

    if (!notificationPreference) {
      const notFoundError = new Error("Notification preference not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    return notificationPreference;
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;
    
    const getError = new Error("Failed to fetch notification preference");
    (getError as Error & { statusCode?: number }).statusCode = 400;
    throw getError;
  }
};

/**
 * Update notification preferences for a user
 * Creates the preference if it doesn't exist (upsert)
 */
export const updateNotificationPreference = async (
  userId: string,
  payload: UpdateNotificationPreferencePayload
) => {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const notFoundError = new Error("User not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    // Build update data (only include fields that were provided)
    const updateData: UpdateNotificationPreferencePayload = {};
    if (payload.emailEnabled !== undefined) {
      updateData.emailEnabled = payload.emailEnabled;
    }
    if (payload.pushEnabled !== undefined) {
      updateData.pushEnabled = payload.pushEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      const badRequestError = new Error("No valid fields provided for update");
      (badRequestError as Error & { statusCode?: number }).statusCode = 400;
      throw badRequestError;
    }

    // Use upsert to update if exists, create if not
    const notificationPreference = await db.notificationPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        emailEnabled: payload.emailEnabled ?? true,
        pushEnabled: payload.pushEnabled ?? true,
      },
    });

    return notificationPreference;
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;

    const updateError = new Error("Failed to update notification preference");
    (updateError as Error & { statusCode?: number }).statusCode = 400;
    throw updateError;
  }
};

/**
 * Delete notification preferences for a user
 */
export const deleteNotificationPreference = async (userId: string) => {
  try {
    // Check if notification preference exists
    const existingPrefs = await db.notificationPreference.findUnique({
      where: { userId },
    });

    if (!existingPrefs) {
      const notFoundError = new Error("Notification preference not found for this user");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    // Delete notification preference
    await db.notificationPreference.delete({
      where: { userId },
    });

    return { message: "Notification preference deleted successfully" };
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;
    
    const deleteError = new Error("Failed to delete notification preference");
    (deleteError as Error & { statusCode?: number }).statusCode = 400;
    throw deleteError;
  }
};

/**
 * Get all notification preferences (admin only)
 */
export const getAllNotificationPreferences = async (page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [preferences, total] = await Promise.all([
      db.notificationPreference.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.notificationPreference.count(),
    ]);

    return {
      items: preferences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) throw error;
    
    const getError = new Error("Failed to fetch notification preferences");
    (getError as Error & { statusCode?: number }).statusCode = 400;
    throw getError;
  }
};
