import express from "express";
import { getConversations, getMessages, sendMessage, markAsRead, getUnreadCounts, verifyToken } from "../Controllers/messageController.js";
// import { isAuthenticated } from "../Middleware/authMiddleware.js";

const router = express.Router();

// router.use(isAuthenticated);

// Get all conversations for the logged-in user
router.get("/conversations", verifyToken, getConversations);

// Get messages between two users
router.get("/messages/:userId", verifyToken, getMessages);

// Send a message
router.post("/send", verifyToken, sendMessage);

// Mark messages as read
router.put("/read/:senderId", verifyToken, markAsRead);

// Get unread message counts
router.get("/unread", verifyToken, getUnreadCounts);

export default router;
