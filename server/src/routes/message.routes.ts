import { Router } from "express";
import requireApiAuth from "../middleware/requireApiAuth.js";
import {
	createMessageController,
	deleteMessageController,
	getMessageByIdController,
	listMessagesByEnquiryController,
	updateMessageController,
} from "../controllers/message.controller.js";

const router = Router();

router.post("/", requireApiAuth, createMessageController);
router.get("/enquiry/:enquiryId", requireApiAuth, listMessagesByEnquiryController);
router.get("/:id", requireApiAuth, getMessageByIdController);
router.patch("/:id", requireApiAuth, updateMessageController);
router.delete("/:id", requireApiAuth, deleteMessageController);

export default router;
