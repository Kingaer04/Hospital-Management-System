const { NotificationData } = require("../Models/NotificationModel");

const NotificationController = {
    sendNotification: async (req, res, io) => { // Accept `io` as a parameter
        const message = req.body.message;
        console.log(message);
        
        // Emit notification
        if (message) {
            io.emit('pushNotification', { message });
            return res.status(200).send('Notification sent!');
        }
        
        return res.status(400).send('Message is required.');
    },
};

module.exports = { NotificationController };