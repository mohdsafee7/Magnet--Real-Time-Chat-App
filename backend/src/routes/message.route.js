import express from "express";
import {
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";


import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar); // Get all users except the logged-in user for the sidebar
router.get("/conversations", getConversationsForSidebar); // Get all conversations for the logged-in user for the sidebar
router.get("/:id", getMessages); // Get all messages between the logged-in user and another user
router.post("/send/:id", upload.single("media"), sendMessage); // Send a message to another user

export default router;
