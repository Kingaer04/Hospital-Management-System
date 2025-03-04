const { NotificationData } = require("../Models/NotificationModel");
const mongoose = require('mongoose');

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

    getUnReadNotifications: async (req, res, next) => {
        const { doctorId } = req.params;
        try {
            const getUnread = await NotificationData.find({ doctor_ID: doctorId, Read: false })
            res.status(200).json(getUnread)
        } catch (error) {
            next(error)
        }
    },
    
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
    },

    getNotificationData: async (req, res) => {
        const { notificationId } = req.params;

        try {
            // Check if models are already registered
            let StaffData, PatientData;

            // Try to get existing models
            try {
                StaffData = mongoose.model('StaffData');
            } catch (error) {
                // If model not registered, import and register
                const staffModule = await import('../../api/Models/StaffModel.js');
                StaffData = staffModule.default || staffModule.StaffData;
                
                // Re-register the model if it's not already registered
                if (!mongoose.models.StaffData) {
                    mongoose.model('StaffData', StaffData.schema);
                }
            }

            // Repeat the same process for PatientData
            try {
                PatientData = mongoose.model('PatientData');
            } catch (error) {
                const patientModule = await import('../../api/Models/PatientModel.js');
                PatientData = patientModule.default || patientModule.PatientData;
                
                if (!mongoose.models.PatientData) {
                    mongoose.model('PatientData', PatientData.schema);
                }
            }

            // Find the notification and populate the receptionist details
            const notification = await NotificationData.findById(notificationId)
                .populate({
                    path: 'receptionist_ID',
                    model: 'StaffData',
                    select: 'name role avatar' // Select specific fields from the receptionist
                })
                .populate({
                    path: 'patient_ID',
                    model: 'PatientData',
                    select: 'first_name last_name email phone avatar' // Select specific fields from the patient
                });
    
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            console.log(notification);

            // Transform the notification to match the frontend expected structure
            const transformedNotification = {
                title: notification.title || 'Notification',
                body: notification.body || notification.message,
                timestamp: notification.createdAt,
                receptionist: {
                    name: notification.receptionist_ID.name,
                    role: notification.receptionist_ID.role,
                    image: notification.receptionist_ID.avatar || notification.receptionistImage
                },
                patient: {
                    name: `${notification.patient_ID.first_name} ${notification.patient_ID.last_name}`,
                    email: notification.patient_ID.email,
                    phone: notification.patient_ID.phone,
                    image: notification.patient_ID.avatar || notification.patientImage
                }
            };
    
            return res.status(200).json(transformedNotification);
    
        } catch (error) {
            console.error('Error fetching notification:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching notification',
                error: error.message
            });
        }
    },
};

module.exports = { NotificationController };