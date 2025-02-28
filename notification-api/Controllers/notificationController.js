const { NotificationData } = require("../Models/NotificationModel");

const NotificationController = {
    sendNotification: async (req, res, io) => {
        const { receptionist_ID, doctor_ID, patient_ID, message } = req.body;
        
        // Log the message
        console.log(`New notification for doctor ${doctor_ID}: ${message}`);
        
        // Validate required fields
        if (!receptionist_ID || !doctor_ID || !patient_ID || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields (receptionist_ID, doctor_ID, patient_ID, message) are required.' 
            });
        }
        
        try {
            // Create a new notification in the database
            const newNotification = new NotificationData({
                receptionist_ID,
                doctor_ID,
                patient_ID,
                message,
                patientName: req.body.patientName,
                patientImage: req.body.patientImage,
                receptionistImage: req.body.receptionistImage,
                Read: false
            });
            
            // Save the notification to the database
            const savedNotification = await newNotification.save();
            
            // Create notification payload with all necessary data
            const notificationPayload = {
                _id: savedNotification._id,
                receptionist_ID,
                doctor_ID,
                patient_ID,
                message,
                patientName: savedNotification.patientName,
                patientImage: savedNotification.patientImage,
                receptionistImage: savedNotification.receptionistImage,
                createdAt: savedNotification.createdAt,
                Read: false
            };
            
            // Emit to specific doctor's room - this is more efficient than broadcasting to everyone
            io.to(`doctor_${doctor_ID}`).emit('newNotification', notificationPayload);
            
            // Also emit a general notification for anyone listening (optional)
            // io.emit('globalNotification', {
            //     doctorId: doctor_ID,
            //     message: 'New appointment booked'
            // });
            
            return res.status(201).json({ 
                success: true, 
                message: 'Notification sent successfully!',
                notification: notificationPayload
            });
        } catch (error) {
            console.error('Error saving notification:', error);
            return res.status(500).json({
                success: false,
                message: 'Error saving notification.',
                error: error.message
            });
        }
    },
    
    // Get all notifications for a specific doctor
    getDoctorNotifications: async (req, res) => {
        const { doctorId } = req.params;
        
        try {
            const notifications = await NotificationData.find({ 
                doctor_ID: doctorId 
            }).sort({ createdAt: -1 }); // Most recent first
            
            return res.status(200).json({
                success: true,
                notifications
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching notifications.',
                error: error.message
            });
        }
    },
    
    // Mark a notification as read
    markAsRead: async (req, res) => {
        const { notificationId } = req.params;
        
        try {
            const notification = await NotificationData.findByIdAndUpdate(
                notificationId,
                { Read: true },
                { new: true }
            );
            
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                notification
            });
        } catch (error) {
            console.error('Error updating notification:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating notification.',
                error: error.message
            });
        }
    }
};

module.exports = { NotificationController };