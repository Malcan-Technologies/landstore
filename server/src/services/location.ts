import db from "../../config/prisma.js";

type CreateLocationPayload = {
  propertyId: string;
  state: string;
  district: string;
  mukim?: string | null;
  section?: string | null;
  latitude: number | string;
  longitude: number | string;
  isApproximate?: boolean;
};

type UpdateLocationPayload = {
  state?: string;
  district?: string;
  mukim?: string | null;
  section?: string | null;
  latitude?: number | string;
  longitude?: number | string;
  isApproximate?: boolean;
};

/**
 * Create a new location for a property
 */
export const createLocation = async (payload: CreateLocationPayload) => {
  try {
    // Check if property exists
    const property = await db.property.findUnique({
      where: { id: payload.propertyId },
    });

    if (!property) {
      const notFoundError = new Error("Property not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    // Check if location already exists for this property
    const existingLocation = await db.location.findUnique({
      where: { propertyId: payload.propertyId },
    });

    if (existingLocation) {
      const conflictError = new Error("Location already exists for this property");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    const location = await db.location.create({
      data: {
        propertyId: payload.propertyId,
        state: payload.state.trim(),
        district: payload.district.trim(),
        mukim: payload.mukim?.trim() || null,
        section: payload.section?.trim() || null,
        latitude: parseFloat(String(payload.latitude)),
        longitude: parseFloat(String(payload.longitude)),
        isApproximate: payload.isApproximate ?? false,
      },
    });

    return location;
  } catch (error: unknown) {
    const err = error as any;

    if (err.statusCode) throw error;

    if (err.code === "P2002") {
      const conflictError = new Error("Location already exists for this property");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    throw err;
  }
};

/**
 * Get location by ID
 */
export const getLocationById = async (id: string) => {
  const location = await db.location.findUnique({
    where: { id },
  });

  if (!location) {
    const notFoundError = new Error("Location not found");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  return location;
};

/**
 * Get location by property ID
 */
export const getLocationByPropertyId = async (propertyId: string) => {
  const location = await db.location.findUnique({
    where: { propertyId },
  });

  if (!location) {
    const notFoundError = new Error("Location not found for this property");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  return location;
};

/**
 * Update location
 */
export const updateLocation = async (id: string, payload: UpdateLocationPayload) => {
  try {
    // Check if location exists
    const existingLocation = await db.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      const notFoundError = new Error("Location not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    const updateData: any = {};

    if (payload.state !== undefined) updateData.state = payload.state.trim();
    if (payload.district !== undefined) updateData.district = payload.district.trim();
    if (payload.mukim !== undefined) updateData.mukim = payload.mukim?.trim() || null;
    if (payload.section !== undefined) updateData.section = payload.section?.trim() || null;
    if (payload.latitude !== undefined) updateData.latitude = parseFloat(String(payload.latitude));
    if (payload.longitude !== undefined) updateData.longitude = parseFloat(String(payload.longitude));
    if (payload.isApproximate !== undefined) updateData.isApproximate = payload.isApproximate;

    const location = await db.location.update({
      where: { id },
      data: updateData,
    });

    return location;
  } catch (error: unknown) {
    const err = error as any;

    if (err.statusCode) throw error;

    if (err.code === "P2025") {
      const notFoundError = new Error("Location not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    throw err;
  }
};

/**
 * Delete location
 */
export const deleteLocation = async (id: string) => {
  try {
    const location = await db.location.findUnique({
      where: { id },
    });

    if (!location) {
      const notFoundError = new Error("Location not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    await db.location.delete({
      where: { id },
    });

    return { message: "Location deleted successfully" };
  } catch (error: unknown) {
    const err = error as any;

    if (err.statusCode) throw error;

    if (err.code === "P2025") {
      const notFoundError = new Error("Location not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    throw err;
  }
};

/**
 * Get all locations (with optional filtering)
 */
export const getAllLocations = async (
  state?: string,
  district?: string
) => {
  const where: any = {};

  if (state) where.state = state.trim();
  if (district) where.district = district.trim();

  return db.location.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};
