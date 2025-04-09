import { Server } from "socket.io";
import StaffData from "../Models/StaffModel.js";

// Map to store user socket connections
const userSockets = new Map();

export const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Match your frontend origin exactly
      methods: ["GET", "POST"],
      credentials: true // Allow credentials
    },
  });

  io.on("connection", async (socket) => {
    console.log("New socket connection:", socket.id);
    
    // Handle user registration
    socket.on("register_user", async (userData) => {
      if (!userData || !userData._id) {
        console.error("Invalid user data for socket registration");
        return;
      }
      
      const userId = userData._id;
      const hospitalId = userData.hospital_ID;
      
      // Store user info on socket object
      socket.user = {
        _id: userId,
        hospital_ID: hospitalId
      };
      
      console.log(`User registered: ${userId}`);
      
      // Store socket connection
      userSockets.set(userId.toString(), socket.id);
      
      // Update user status to online
      await StaffData.findByIdAndUpdate(userId, {
        status: "Online",
        lastSeen: new Date(),
      });
      
      // Broadcast to everyone that this user is online
      socket.broadcast.emit("user_status_change", {
        userId: userId.toString(),
        status: "Online",
        lastSeen: new Date(),
      });
      
      // Join a room for the hospital
      if (hospitalId) {
        socket.join(`hospital_${hospitalId}`);
      }
    });

    // Listen for new messages
    socket.on("send_message", (data) => {
      console.log("Message received to deliver:", data);
      
      const receiverSocketId = userSockets.get(data.receiverId);
      
      // If receiver is online, emit to their socket
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", {
          ...data,
          createdAt: new Date(),
        });
        console.log(`Message delivered to socket: ${receiverSocketId}`);
      } else {
        console.log(`Receiver ${data.receiverId} is not online`);
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
        
        // Handle disconnect event
        socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (socket.user && socket.user._id) {
        const userId = socket.user._id;
        
        // Remove from socket map
        userSockets.delete(userId.toString());
        
        // Update user status to offline
        await StaffData.findByIdAndUpdate(userId, {
          status: "Offline",
          lastSeen: new Date(),
        });
        
        // Broadcast to everyone that this user is offline
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