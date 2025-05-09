import Message from "../Models/MessageModel.js";
import StaffData from "../Models/StaffModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// Send a file message
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Update your multer configuration in the ChatController.js

// Configure storage with better mime type handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let extension = path.extname(file.originalname);
    
    // If it's an audio file with no extension, add appropriate extension
    if (file.fieldname === 'audio' && !extension) {
      if (file.mimetype === 'audio/webm') {
        extension = '.webm';
      } else if (file.mimetype === 'audio/mp3' || file.mimetype === 'audio/mpeg') {
        extension = '.mp3';
      } else if (file.mimetype === 'audio/wav') {
        extension = '.wav';
      } else {
        extension = '.audio'; // fallback
      }
    }
    
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Add better file filtering
const fileFilter = (req, file, cb) => {
  // Accept audio files for audio field
  if (file.fieldname === 'audio') {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      return cb(null, true);
    }
    return cb(new Error('Only audio files are allowed for voice messages'), false);
  }
  
  // Accept all files for the file field
  if (file.fieldname === 'file') {
    return cb(null, true);
  }
  
  cb(new Error('Unexpected field'), false);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

// Middleware for file uploads
export const uploadFile = upload.single('file');
export const uploadAudio = upload.single('audio');

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          // If token is invalid or expired, call signOut
          return signOut(req, res, next);
      }

      req.user = user;
      next();
  });
}

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const hospitalId = req.user.hospitalId;
    // console.log(userId, hospitalId)
    const staffMembers = await StaffData.find({
      hospital_ID: hospitalId,
      _id: { $ne: userId }, // Exclude the current user
    }).select("name avatar role status lastSeen _id");
    // console.log('staffMembers: ', staffMembers)

    // For each staff member, get the last message (if any)
    const conversations = await Promise.all(
      staffMembers.map(async (staff) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: staff._id },
            { sender: staff._id, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          sender: staff._id,
          receiver: userId,
          read: false,
        });

        return {
          staff: {
            _id: staff._id,
            name: staff.name,
            avatar: staff.avatar,
            role: staff.role,
            status: staff.status,
            lastSeen: staff.lastSeen,
          },
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    // Sort conversations by the timestamp of the last message (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    // console.log('conversations: ', conversations)

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ message: "Failed to get conversations" });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Validate that both users have the same hospital_ID
    const [currentUser, otherUser] = await Promise.all([
      StaffData.findById(currentUserId).select("hospital_ID"),
      StaffData.findById(userId).select("hospital_ID name avatar role status lastSeen"),
    ]);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.hospital_ID.toString() !== otherUser.hospital_ID.toString()) {
      return res.status(403).json({ message: "Cannot access messages from different hospitals" });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar");

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      messages,
      user: otherUser,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Failed to get messages: ", error });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const hospitalId = req.user.hospitalId;

    if (!content || !receiverId) {
      return res.status(400).json({ message: "Receiver ID and content are required" });
    }

    // Ensure receiver is from the same hospital
    const receiver = await StaffData.findOne({
      _id: receiverId,
      hospital_ID: hospitalId,
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found or not from the same hospital",
      });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      hospital_ID: hospitalId,
    });

    await newMessage.save();

    // Populate sender information for the response
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// Get unread message counts
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id;  // Updated to use req.user.id from token

    // Aggregate to count unread messages from each sender
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          read: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(unreadCounts);
  } catch (error) {
    console.error("Error getting unread counts:", error);
    res.status(500).json({ message: "Failed to get unread counts" });
  }
};

// Send a file message
export const sendFile = async (req, res) => {
  try {
    console.log("File request received:", req.file);
    console.log("Request body:", req.body);
    
    const receiverId = req.body.receiverId;
    const senderId = req.user.id;
    const hospitalId = req.user.hospitalId;

    if (!req.file || !receiverId) {
      return res.status(400).json({ message: "Receiver ID and file are required" });
    }

    // Ensure receiver is from the same hospital
    const receiver = await StaffData.findOne({
      _id: receiverId,
      hospital_ID: hospitalId,
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found or not from the same hospital",
      });
    }

    // Create file URL (relative to server)
    const fileUrl = `/uploads/${req.file.filename}`;

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      messageType: "file",
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      hospital_ID: hospitalId,
    });

    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending file:", error);
    res.status(500).json({ message: "Failed to send file" });
  }
};

// Send a voice message
export const sendVoiceMessage = async (req, res) => {
  try {
    console.log("Voice request received:", req.file);
    console.log("Request body:", req.body);
    
    const receiverId = req.body.receiverId;
    const duration = req.body.duration || 0;
    const senderId = req.user.id;
    const hospitalId = req.user.hospitalId;

    if (!req.file || !receiverId) {
      return res.status(400).json({ message: "Receiver ID and audio are required" });
    }

    // Ensure receiver is from the same hospital
    const receiver = await StaffData.findOne({
      _id: receiverId,
      hospital_ID: hospitalId,
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found or not from the same hospital",
      });
    }

    // Create audio URL (relative to server)
    const audioUrl = `/uploads/${req.file.filename}`;

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      messageType: "voice",
      audioUrl,
      duration: parseInt(duration, 10),
      hospital_ID: hospitalId,
    });

    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending voice message:", error);
    res.status(500).json({ message: "Failed to send voice message" });
  }
};
