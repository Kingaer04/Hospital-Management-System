const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors('*'));
app.use(express.json());

// Track connected doctors with their socket IDs
const connectedDoctors = new Map();

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // When a doctor logs in, store their socket ID and join them to their room
    socket.on('doctor_login', (doctorId) => {
        if (doctorId) {
            console.log(`Doctor ${doctorId} connected with socket ID ${socket.id}`);
            connectedDoctors.set(doctorId, socket.id);
            
            // Join the doctor to their specific room for targeted notifications
            socket.join(`doctor_${doctorId}`);
        }
    });
    
    // Handle disconnections
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Remove the disconnected doctor from the map
        for (const [doctorId, socketId] of connectedDoctors.entries()) {
            if (socketId === socket.id) {
                console.log(`Doctor ${doctorId} disconnected`);
                connectedDoctors.delete(doctorId);
                break;
            }
        }
    });
});

// Make io and connectedDoctors available to the routes
app.set('io', io);
app.set('connectedDoctors', connectedDoctors);

// Pass both io and connectedDoctors to the router
const router = require('./Routes/indexRoute')(io, connectedDoctors);
app.use('/', router);

mongoose.connect(process.env.MONGO)
    .then(() => console.log("Database connected successfully!"))
    .catch(err => console.error("Database connection error:", err));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = { io, connectedDoctors };