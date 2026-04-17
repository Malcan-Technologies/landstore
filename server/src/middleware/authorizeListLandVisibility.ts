import type { Request, Response, NextFunction } from "express";
import db from "../../config/prisma.js";

const authorizeListLandVisibility = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const propertyId = req.params.id;
		if (typeof propertyId !== "string" || !propertyId.trim()) {
			return res.status(400).json({
				message: "Invalid property id",
			});
		}

		const property = await db.property.findUnique({
			where: { id: propertyId },
			select: {
				id: true,
				status: true,
				userId: true,
			},
		});

		if (!property) {
			return res.status(404).json({
				message: "Property not found",
			});
		}

		const user = (req as any).user as
			| { id: string; userType?: string }
			| undefined;

		if (!user) {
			if (property.status !== "active") {
				return res.status(404).json({
					message: "Property not found",
				});
			}

			(req as any).viewerScope = "public";

			return next();
		}

		const dbUser = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				userType: true,
			},
		});

		if (!dbUser) {
			return res.status(401).json({
				message: "Authentication required. Please log in again.",
			});
		}

		if (dbUser.userType === "admin") {
			(req as any).viewerScope = "admin";
			return next();
		}

		if (dbUser.userType === "user" && property.userId === dbUser.id) {
			(req as any).viewerScope = "owner";
			return next();
		}

		if (property.status === "active") {
			(req as any).viewerScope = "public";
			return next();
		}

		return res.status(404).json({
			message: "Property not found",
		});
	} catch (error: unknown) {
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

export default authorizeListLandVisibility;
