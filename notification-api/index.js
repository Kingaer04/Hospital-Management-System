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

// Pass `io` to the router
const router = require('./Routes/indexRoute')(io); // Pass `io` here
app.use('/', router);

mongoose.connect(process.env.MONGO)
    .then(() => console.log("Database connected successfully!"))
    .catch(err => console.error("Database connection error:", err));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = { io };