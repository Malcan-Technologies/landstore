import type { Request, Response } from "express";
import {
  createLeaseholdDetail,
  getLeaseholdDetailById,
  getLeaseholdDetailByPropertyId,
  updateLeaseholdDetail,
  deleteLeaseholdDetail,
  getAllLeaseholdDetails,
  calculateRemainingLeasePeriod,
} from "../services/leasehold.js";

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
 * Create leasehold detail for a property
 * POST /api/leaseholds
 */
export const createLeaseholdDetailController = async (req: Request, res: Response) => {
  try {
    const { propertyId, startYear, leasePeriodYears } = req.body;

    // Validate required fields
    if (!propertyId || typeof propertyId !== "string" || !propertyId.trim()) {
      return res.status(400).json({ message: "Valid propertyId is required" });
    }
    if (startYear === undefined || startYear === null || typeof startYear !== "number") {
      return res.status(400).json({ message: "Valid startYear (number) is required" });
    }
    if (leasePeriodYears === undefined || leasePeriodYears === null || typeof leasePeriodYears !== "number") {
      return res.status(400).json({ message: "Valid leasePeriodYears (number) is required" });
    }

    const leaseholdDetail = await createLeaseholdDetail({
      propertyId: propertyId.trim(),
      startYear,
      leasePeriodYears,
    });

    return res.status(201).json({ success: true, message: "Leasehold detail created successfully", leaseholdDetail });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Get leasehold detail by ID
 * GET /api/leaseholds/:id
 */
export const getLeaseholdDetailByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "Valid leasehold detail ID is required" });
    }

    const leaseholdDetail = await getLeaseholdDetailById(id);
    const remaining = calculateRemainingLeasePeriod(leaseholdDetail.startYear, leaseholdDetail.leasePeriodYears);

    return res.status(200).json({
      success: true,
      leaseholdDetail,
      remainingLeaseInfo: remaining,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Get leasehold detail by property ID
 * GET /api/leaseholds/property/:propertyId
 */
export const getLeaseholdDetailByPropertyIdController = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId || typeof propertyId !== "string" || !propertyId.trim()) {
      return res.status(400).json({ message: "Valid propertyId is required" });
    }

    const leaseholdDetail = await getLeaseholdDetailByPropertyId(propertyId);
    const remaining = calculateRemainingLeasePeriod(leaseholdDetail.startYear, leaseholdDetail.leasePeriodYears);

    return res.status(200).json({
      success: true,
      leaseholdDetail,
      remainingLeaseInfo: remaining,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Update leasehold detail
 * PUT /api/leaseholds/:id
 */
export const updateLeaseholdDetailController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startYear, leasePeriodYears } = req.body;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "Valid leasehold detail ID is required" });
    }

    const leaseholdDetail = await updateLeaseholdDetail(id, {
      startYear,
      leasePeriodYears,
    });

    const remaining = calculateRemainingLeasePeriod(leaseholdDetail.startYear, leaseholdDetail.leasePeriodYears);

    return res.status(200).json({
      success: true,
      message: "Leasehold detail updated successfully",
      leaseholdDetail,
      remainingLeaseInfo: remaining,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Delete leasehold detail
 * DELETE /api/leaseholds/:id
 */
export const deleteLeaseholdDetailController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "Valid leasehold detail ID is required" });
    }

    const result = await deleteLeaseholdDetail(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * Get all leasehold details
 * GET /api/leaseholds
 */
export const getAllLeaseholdDetailsController = async (req: Request, res: Response) => {
  try {
    const { startYearFrom, startYearTo } = req.query;

    const leaseholdDetails = await getAllLeaseholdDetails(
      startYearFrom ? Number(startYearFrom) : undefined,
      startYearTo ? Number(startYearTo) : undefined
    );

    return res.status(200).json({
      success: true,
      leaseholdDetails,
      count: leaseholdDetails.length,
    });
  } catch (error: unknown) {
    const { statusCode, message } = getErrorPayload(error);
    return res.status(statusCode).json({ success: false, message });
  }
};
