const express = require('express');
const { NotificationController } = require('../Controllers/notificationController.js');

const router = express.Router();

// Modify this to accept `io`
module.exports = (io) => {
    router.post('/send-notification', (req, res) => NotificationController.sendNotification(req, res, io));
    return router; // Return the configured router
};