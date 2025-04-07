// controllers/messageController.js
import { Message } from '../models/Message.js';

// Get messages between two users
export const getConversation = async (req, res) => {
  try {
    const { userId, receiverId } = req.query;
    
    // Find messages between two users, ordered by timestamp
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar role status')
    .populate('receiver', 'name avatar role status');
    
    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find all messages where the user is either sender or receiver
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { receiver: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$readAt', null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'conversationWith'
        }
      },
      {
        $unwind: '$conversationWith'
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          unreadCount: 1,
          'conversationWith.name': 1,
          'conversationWith.avatar': 1,
          'conversationWith.role': 1,
          'conversationWith.status': 1
        }
      }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
};

// Get hospital-wide messages
export const getHospitalMessages = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    // Find hospital-wide messages
    const messages = await Message.find({ 
      hospitalId, 
      receiver: null // Hospital-wide messages have no specific receiver
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar role status');
    
    res.json(messages);
  } catch (error) {
    console.error('Get hospital messages error:', error);
    res.status(500).json({ message: 'Failed to fetch hospital messages', error: error.message });
  }
};

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { sender, receiver, hospitalId, text, mediaUrl, messageType } = req.body;
    
    const newMessage = new Message({
      sender,
      receiver,
      hospitalId,
      text: text || '',
      mediaUrl: mediaUrl || '',
      messageType: messageType || 'text'
    });
    
    const savedMessage = await newMessage.save();
    
    // Populate sender and receiver details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name avatar role status')
      .populate('receiver', 'name avatar role status');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Failed to create message', error: error.message });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    
    // Update all unread messages from sender to receiver
    const result = await Message.updateMany(
      { 
        sender: senderId,
        receiver: receiverId,
        readAt: null
      },
      { 
        readAt: new Date() 
      }
    );
    
    res.json({ marked: result.nModified });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read', error: error.message });
  }
};
