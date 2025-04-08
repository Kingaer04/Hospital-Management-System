import express from "express";
import { getConversations, getMessages, sendMessage, markAsRead, getUnreadCounts, } from "../Controllers/messageController.js";
// import { isAuthenticated } from "../Middleware/authMiddleware.js";
import { adminController } from '../../api/Controllers/adminController.js';

const router = express.Router();

// router.use(isAuthenticated);

// Get all conversations for the logged-in user
router.get("/conversations", adminController.verifyToken, getConversations);

// Get messages between two users
router.get("/messages/:userId", adminController.verifyToken, getMessages);

// Send a message
router.post("/send", adminController.verifyToken, sendMessage);

// Mark messages as read
router.put("/read/:senderId", adminController.verifyToken, markAsRead);

// Get unread message counts
router.get("/unread", adminController.verifyToken, getUnreadCounts);

export default router;
