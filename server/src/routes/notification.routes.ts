import { Router } from "express";
import {
	createNotificationController,
	getNotificationsController,
	getNotificationByIdController,
	getNotificationsByUserIdController,
	getUnreadNotificationCountController,
	updateNotificationController,
	markAsReadController,
	markAllAsReadController,
	deleteNotificationController,
	deleteAllNotificationsByUserIdController,
} from "../controllers/notification.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";

const router = Router();

// Notification filter routes (specific routes before parameterized routes)
router.get("/user/:userId", requireApiAuth, getNotificationsByUserIdController);
router.get("/user/:userId/unread-count", requireApiAuth, getUnreadNotificationCountController);
router.patch("/user/:userId/mark-all-as-read", requireApiAuth, markAllAsReadController);
router.delete("/user/:userId/all", requireApiAuth, deleteAllNotificationsByUserIdController);

// Notification CRUD routes
router.post("/", requireApiAuth, createNotificationController);
router.get("/", requireApiAuth, getNotificationsController);
router.get("/:id", requireApiAuth, getNotificationByIdController);
router.patch("/:id", requireApiAuth, updateNotificationController);
router.patch("/:id/mark-as-read", requireApiAuth, markAsReadController);
router.delete("/:id", requireApiAuth, deleteNotificationController);

export default router;
