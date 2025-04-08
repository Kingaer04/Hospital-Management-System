import { Server } from "socket.io";
import StaffData from "../../api/Models/StaffModel.js";

// Map to store user socket connections
const userSockets = new Map();

export const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // In production, specify exact origin
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    // Instead of getting user from token, expect client to send user info
    socket.on("register_user", async (userData) => {
      const userId = userData._id;
      const hospitalId = userData.hospital_ID;
      
      // Store user info on socket object
      socket.user = {
        _id: userId,
        hospital_ID: hospitalId
      };
      
      console.log(`User connected: ${userId}`);
      
      // Store socket connection
      userSockets.set(userId.toString(), socket.id);
      
      // Update user status to online
      await StaffData.findByIdAndUpdate(userId, {
        status: "Online",
        lastSeen: new Date(),
      });
      
      // Broadcast to hospital members that this user is online
      socket.broadcast.emit("user_status_change", {
        userId: userId.toString(),
        status: "Online",
        lastSeen: new Date(),
      });
      
      // Join a room for the hospital
      socket.join(`hospital_${hospitalId}`);
    });

    // Listen for new messages
    socket.on("send_message", (data) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      
      // If receiver is online, emit to their socket
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", {
          ...data,
          createdAt: new Date(),
        });
      }
      
      // Also emit to sender for confirmation
      socket.emit("message_sent", {
        messageId: data.messageId,
        status: "sent",
        timestamp: new Date(),
      });
    });
    
    // Listen for typing events
    socket.on("typing", (data) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", {
          senderId: socket.user?._id.toString(),
          typing: data.typing,
        });
      }
    });
    
    // Listen for read receipts
    socket.on("mark_read", (data) => {
      const senderSocketId = userSockets.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_read", {
          receiverId: socket.user?._id.toString(),
          timestamp: new Date(),
        });
      }
    });
    
    // Handle disconnect
    socket.on("disconnect", async () => {
      if (socket.user) {
        const userId = socket.user._id;
        console.log(`User disconnected: ${userId}`);
        
        // Remove from active connections
        userSockets.delete(userId.toString());
        
        // Update user status to offline
        await StaffData.findByIdAndUpdate(userId, {
          status: "Offline",
          lastSeen: new Date(),
        });
        
        // Broadcast to hospital members that this user is offline
        socket.broadcast.emit("user_status_change", {
          userId: userId.toString(),
          status: "Offline",
          lastSeen: new Date(),
        });
      }
    });
  });

  return io;
};

// Export helper function to get user connections
export const getUserSocket = (userId) => {
  return userSockets.get(userId.toString());
};
