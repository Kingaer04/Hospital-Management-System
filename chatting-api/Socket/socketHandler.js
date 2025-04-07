// socket/socketHandler.js
import { HospitalAdminAccount } from '../../api/Models/AdminModel.js'
import { Message } from '../Models/MessageModel.js';

// Map to keep track of connected users
const connectedUsers = new Map();

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // User online status
    socket.on('userOnline', async ({ userId }) => {
      try {
        // Store user connection
        connectedUsers.set(userId, {
          socketId: socket.id,
          userId,
          status: 'online'
        });
        
        // Update user status in database
        await HospitalAdminAccount.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
        
        // Broadcast user online status to all connected clients
        io.emit('userStatus', {
          userId,
          status: 'online'
        });
        
        // Join user to their hospital room
        const user = await HospitalAdminAccount.findById(userId);
        if (user && user.hospitalId) {
          socket.join(`hospital_${user.hospitalId}`);
        }
        
        // Send currently online users to newly connected client
        const onlineUsers = Array.from(connectedUsers.keys()).map(id => ({
          userId: id,
          status: connectedUsers.get(id).status
        }));
        
        socket.emit('onlineUsers', onlineUsers);
      } catch (error) {
        console.error('User online error:', error);
      }
    });
    
    // Handle status change
    socket.on('changeStatus', async ({ userId, status }) => {
      try {
        if (connectedUsers.has(userId)) {
          const userData = connectedUsers.get(userId);
          userData.status = status;
          connectedUsers.set(userId, userData);
          
          // Update in database
          await User.findByIdAndUpdate(userId, { status });
          
          // Broadcast to all users
          io.emit('userStatus', { userId, status });
        }
      } catch (error) {
        console.error('Status change error:', error);
      }
    });
    
    // Handle new message
    socket.on('sendMessage', async (messageData) => {
      try {
        const { sender, receiver, hospitalId, text, mediaUrl, messageType } = messageData;
        
        // Create new message in database
        const newMessage = new Message({
          sender,
          receiver, 
          hospitalId,
          text: text || '',
          mediaUrl: mediaUrl || '',
          messageType: messageType || 'text'
        });
        
        const savedMessage = await newMessage.save();
        
        // Populate sender and receiver info
        const populatedMessage = await Message.findById(savedMessage._id)
          .populate('sender', 'name avatar role status')
          .populate('receiver', 'name avatar role status');
          
        // Send to specific receiver if online
        if (receiver && connectedUsers.has(receiver)) {
          const receiverSocket = connectedUsers.get(receiver).socketId;
          io.to(receiverSocket).emit('newMessage', populatedMessage);
        }
        
        // Send confirmation to sender
        socket.emit('messageSent', populatedMessage);
        
        // Broadcast to hospital room if it's a hospital-wide message
        if (hospitalId && !receiver) {
          io.to(`hospital_${hospitalId}`).emit('newMessage', populatedMessage);
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
      if (receiverId && connectedUsers.has(receiverId)) {
        const receiverSocket = connectedUsers.get(receiverId).socketId;
        io.to(receiverSocket).emit('userTyping', {
          userId: senderId,
          isTyping
        });
      }
    });
    
    // Handle read receipts
    socket.on('markAsRead', async ({ messageIds, senderId, receiverId }) => {
      try {
        // Update messages in database
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { readAt: new Date() }
        );
        
        // Notify sender that messages were read
        if (senderId && connectedUsers.has(senderId)) {
          const senderSocket = connectedUsers.get(senderId).socketId;
          io.to(senderSocket).emit('messagesRead', {
            messageIds,
            readAt: new Date(),
            readBy: receiverId
          });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });
    
    // Handle file upload notification
    socket.on('fileUploaded', (data) => {
      const { receiverId } = data;
      if (receiverId && connectedUsers.has(receiverId)) {
        const receiverSocket = connectedUsers.get(receiverId).socketId;
        io.to(receiverSocket).emit('fileUploadNotification', data);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      // Find disconnected user
      let disconnectedUserId = null;
      for (const [userId, data] of connectedUsers.entries()) {
        if (data.socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      
      if (disconnectedUserId) {
        // Update user status in database
        await User.findByIdAndUpdate(disconnectedUserId, {
          status: 'offline',
          lastSeen: new Date()
        });
        
        // Remove from connected users
        connectedUsers.delete(disconnectedUserId);
        
        // Broadcast offline status
        io.emit('userStatus', {
          userId: disconnectedUserId,
          status: 'offline'
        });
      }
    });
  });
};
