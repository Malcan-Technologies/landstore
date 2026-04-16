import type { Request, Response } from "express";
import {
  createLocation,
  getLocationById,
  getLocationByPropertyId,
  updateLocation,
  deleteLocation,
  getAllLocations,
} from "../services/location.js";

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
 * Create location for a property
 * POST /api/locations
 */
export const createLocationController = async (req: Request, res: Response) => {
  try {
    const { propertyId, state, district, mukim, section, latitude, longitude, isApproximate } =
      req.body;

    // Validate required fields
    if (!propertyId || typeof propertyId !== "string" || !propertyId.trim()) {
      return res.status(400).json({ message: "Valid propertyId is required" });
    }
    if (!state || typeof state !== "string" || !state.trim()) {
      return res.status(400).json({ message: "State is required" });
    }
    if (!district || typeof district !== "string" || !district.trim()) {
      return res.status(400).json({ message: "District is required" });
    }
    if (latitude === undefined || latitude === null) {
      return res.status(400).json({ message: "Latitude is required" });
    }
    if (longitude === undefined || longitude === null) {
      return res.status(400).json({ message: "Longitude is required" });
    }

    const location = await createLocation({
      propertyId: propertyId.trim(),
      state: state.trim(),
      district: district.trim(),
      mukim: mukim?.trim() || null,
      section: section?.trim() || null,
      latitude,
      longitude,
      isApproximate,
    });

    return res.status(201).json({ success: true, message: "Location created successfully", location });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Get location by ID
 * GET /api/locations/:id
 */
export const getLocationByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "Valid location ID is required" });
    }

    const location = await getLocationById(id);
    return res.status(200).json({ success: true, location });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Get location by property ID
 * GET /api/locations/property/:propertyId
 */
export const getLocationByPropertyIdController = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId || typeof propertyId !== "string" || !propertyId.trim()) {
      return res.status(400).json({ message: "Valid propertyId is required" });
    }

    const location = await getLocationByPropertyId(propertyId);
    return res.status(200).json({ success: true, location });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Update location
 * PUT /api/locations/:id
 */
export const updateLocationController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state, district, mukim, section, latitude, longitude, isApproximate } = req.body;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "Valid location ID is required" });
    }

    const location = await updateLocation(id, {
      state,
      district,
      mukim: mukim ?? undefined,
      section: section ?? undefined,
      latitude,
      longitude,
      isApproximate,
    });

    return res.status(200).json({ success: true, message: "Location updated successfully", location });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Delete location
 * DELETE /api/locations/:id
 */
export const deleteLocationController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "Valid location ID is required" });
    }

    const result = await deleteLocation(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Get all locations
 * GET /api/locations
 */
export const getAllLocationsController = async (req: Request, res: Response) => {
  try {
    const { state, district, page, limit } = req.query;

    const result = await getAllLocations(
      state ? String(state) : undefined,
      district ? String(district) : undefined,
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10
    );

    return res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};
