import express from "express";
import { getConversations, getMessages, sendMessage, markAsRead, getUnreadCounts, sendFile, sendVoiceMessage, verifyToken } from "../Controllers/messageController.js";

const router = express.Router();


// Get all conversations for the logged-in user
router.get("/conversations", verifyToken, getConversations);

// Get messages between two users
router.get("/messages/:userId", verifyToken, getMessages);

// Send a message
router.post("/send", verifyToken, sendMessage);

// Mark messages as read
router.post("/read/:senderId", verifyToken, markAsRead);

// Get unread message counts
router.get("/unread", verifyToken, getUnreadCounts);

router.post('/send-file', verifyToken, sendFile);
router.post('/send-voice', verifyToken, sendVoiceMessage);

export default router;
