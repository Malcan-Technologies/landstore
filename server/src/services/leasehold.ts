import db from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

type CreateLeaseholdDetailPayload = {
  propertyId: string;
  startYear: number;
  leasePeriodYears: number;
};

type UpdateLeaseholdDetailPayload = {
  startYear?: number;
  leasePeriodYears?: number;
};

/**
 * Create leasehold detail for a property
 */
export const createLeaseholdDetail = async (payload: CreateLeaseholdDetailPayload) => {
  try {
    // Validate property exists
    const property = await db.property.findUnique({
      where: { id: payload.propertyId },
    });

    if (!property) {
      const notFoundError = new Error("Property not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    // Check if leasehold detail already exists
    const existingLeasehold = await db.leaseholdDetail.findUnique({
      where: { propertyId: payload.propertyId },
    });

    if (existingLeasehold) {
      const conflictError = new Error("Leasehold detail already exists for this property");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    // Validate start year
    const currentYear = new Date().getFullYear();
    if (payload.startYear > currentYear) {
      const badRequestError = new Error("Start year cannot be in the future");
      (badRequestError as Error & { statusCode?: number }).statusCode = 400;
      throw badRequestError;
    }

    // Validate lease period
    if (payload.leasePeriodYears <= 0) {
      const badRequestError = new Error("Lease period must be greater than 0");
      (badRequestError as Error & { statusCode?: number }).statusCode = 400;
      throw badRequestError;
    }

    const leaseholdDetail = await db.leaseholdDetail.create({
      data: {
        propertyId: payload.propertyId,
        startYear: payload.startYear,
        leasePeriodYears: payload.leasePeriodYears,
      },
    });

    return leaseholdDetail;
  } catch (error: unknown) {
    const err = error as any;

    if (err.statusCode) throw error;

    if (err.code === "P2002") {
      const conflictError = new Error("Leasehold detail already exists for this property");
      (conflictError as Error & { statusCode?: number }).statusCode = 409;
      throw conflictError;
    }

    throw err;
  }
};

/**
 * Get leasehold detail by ID
 */
export const getLeaseholdDetailById = async (id: string) => {
  const leaseholdDetail = await db.leaseholdDetail.findUnique({
    where: { id },
  });

  if (!leaseholdDetail) {
    const notFoundError = new Error("Leasehold detail not found");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  return leaseholdDetail;
};

/**
 * Get leasehold detail by property ID
 */
export const getLeaseholdDetailByPropertyId = async (propertyId: string) => {
  const leaseholdDetail = await db.leaseholdDetail.findUnique({
    where: { propertyId },
  });

  if (!leaseholdDetail) {
    const notFoundError = new Error("Leasehold detail not found for this property");
    (notFoundError as Error & { statusCode?: number }).statusCode = 404;
    throw notFoundError;
  }

  return leaseholdDetail;
};

/**
 * Update leasehold detail
 */
export const updateLeaseholdDetail = async (
  id: string,
  payload: UpdateLeaseholdDetailPayload
) => {
  try {
    // Check if leasehold detail exists
    const existingLeasehold = await db.leaseholdDetail.findUnique({
      where: { id },
    });

    if (!existingLeasehold) {
      const notFoundError = new Error("Leasehold detail not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    const updateData: any = {};

    if (payload.startYear !== undefined) {
      const currentYear = new Date().getFullYear();
      if (payload.startYear > currentYear) {
        const badRequestError = new Error("Start year cannot be in the future");
        (badRequestError as Error & { statusCode?: number }).statusCode = 400;
        throw badRequestError;
      }
      updateData.startYear = payload.startYear;
    }

    if (payload.leasePeriodYears !== undefined) {
      if (payload.leasePeriodYears <= 0) {
        const badRequestError = new Error("Lease period must be greater than 0");
        (badRequestError as Error & { statusCode?: number }).statusCode = 400;
        throw badRequestError;
      }
      updateData.leasePeriodYears = payload.leasePeriodYears;
    }

    const leaseholdDetail = await db.leaseholdDetail.update({
      where: { id },
      data: updateData,
    });

    return leaseholdDetail;
  } catch (error: unknown) {
    const err = error as any;

    if (err.statusCode) throw error;

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      const notFoundError = new Error("Leasehold detail not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    throw err;
  }
};

/**
 * Delete leasehold detail
 */
export const deleteLeaseholdDetail = async (id: string) => {
  try {
    const leaseholdDetail = await db.leaseholdDetail.findUnique({
      where: { id },
    });

    if (!leaseholdDetail) {
      const notFoundError = new Error("Leasehold detail not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    await db.leaseholdDetail.delete({
      where: { id },
    });

    return { message: "Leasehold detail deleted successfully" };
  } catch (error: unknown) {
    const err = error as any;

    if (err.statusCode) throw error;

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      const notFoundError = new Error("Leasehold detail not found");
      (notFoundError as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundError;
    }

    throw err;
  }
};

/**
 * Get all leasehold details (with optional filtering by year range)
 */
export const getAllLeaseholdDetails = async (
  startYearFrom?: number,
  startYearTo?: number
) => {
  const where: any = {};

  if (startYearFrom !== undefined) {
    where.startYear = { ...where.startYear, gte: startYearFrom };
  }
  if (startYearTo !== undefined) {
    where.startYear = { ...where.startYear, lte: startYearTo };
  }

  return db.leaseholdDetail.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Calculate remaining lease period
 */
export const calculateRemainingLeasePeriod = (
  startYear: number,
  leasePeriodYears: number
): { remainingYears: number; expiryYear: number; isExpired: boolean } => {
  const currentYear = new Date().getFullYear();
  const expiryYear = startYear + leasePeriodYears;
  const remainingYears = expiryYear - currentYear;
  const isExpired = remainingYears < 0;

  return {
    remainingYears: Math.max(0, remainingYears),
    expiryYear,
    isExpired,
  };
};
