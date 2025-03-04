import { useEffect } from 'react';
import io from 'socket.io-client';

// Create a singleton socket instance
const socket = io('http://localhost:3000');

const SendingNotification = ({ doctorId, patientId, patientName, patientImage, receptionistId, receptionistImage, reason }) => {
    useEffect(() => {
        const sendNotification = async () => {
            // Ensure all required data is available
            if (!doctorId || !patientId || !receptionistId || !reason) {
                console.log('Missing required data for notification');
                return;
            }

            const message = `New Patient Arrival: Reason - ${reason}`;
            
            try {
                // Send notification to the backend for storage and immediate delivery
                const response = await fetch('http://localhost:3000/notification/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        receptionist_ID: receptionistId,
                        receptionistImage: receptionistImage,
                        doctor_ID: doctorId,
                        patient_ID: patientId,
                        patientName: patientName,
                        patientImage: patientImage,
                        message: message,
                    }),
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('Notification sent successfully:', result.notification);
                } else {
                    console.error('Failed to send notification:', result.message);
                }
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        };

        sendNotification();
    }, [doctorId, patientId, patientName, patientImage, receptionistId, receptionistImage, reason]);

    return null; 
};

export default SendingNotification;