// routes/messageRoutes.js
import express from 'express';
import { getConversation, getUserConversations, getHospitalMessages, createMessage, markMessagesAsRead } from '../Controllers/messageController.js';

const router = express.Router();

// Get messages between two users
router.get('/conversation', getConversation);

// Get all conversations for a user
router.get('/user/:userId', getUserConversations);

// Get hospital-wide messages
router.get('/hospital', getHospitalMessages);

// Create a new message
router.post('/', createMessage);

// Mark messages as read
router.put('/read', markMessagesAsRead);

export default router;
