import StaffData from '../Models/StaffModel.js'
import BookingAppointment from '../Models/BoookingAppointmentModel.js';
import PatientData from '../Models/PatientModel.js';
import { get } from 'http';

export const receptionistController = {
    getDoctors: async (req, res) => {
        try {
            const doctors = await StaffData.find({ hospital_ID: req.params.hospital_ID, role: 'Doctor', availability_Status: true });
            res.status(200).json(doctors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllAppointment: async (req, res) => {
        try {
            const appointment_bookings = await BookingAppointment.find({ hospital_ID: req.params.hospital_ID }).populate('patientId', 'first_name last_name email phone avatar').populate('doctorId', 'name email phone');
            console.log(appointment_bookings);
            res.status(200).json(appointment_bookings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateAppointmentCheckOut: async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { checkOut } = req.body;
            
            if (!checkOut) {
                return res.status(400).json({ message: 'checkOut is required' });
            }
            
            // First fetch the appointment
            const appointment = await BookingAppointment.findById(appointmentId);
            
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            
            // Check if the status is already set to the requested value
            if (appointment.checkOut === checkOut) {
                return res.status(200).json({ 
                message: 'Appointment checkOut already set to ' + checkOut,
                appointment 
                });
            }
        
            // Log the status change (optional)
            console.log(`Appointment ${appointmentId} status changing from ${appointment.checkOut} to ${checkOut}`);
        
            // Update the status
            appointment.checkOut = new Date();
            
            // Save the changes
            await appointment.save();
            
            res.status(200).json(appointment);
        } 
        catch (error) {
            console.error('Error updating appointment checkOut:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getRecentCheckouts: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const recentCheckout = await BookingAppointment.find({ hospital_ID, checkOut: { $exists: true , $ne: null} })
                .populate('patientId', 'first_name last_name email phone avatar')
                .populate('doctorId', 'name email phone')
                .sort({ checkOut: -1 })
                .limit(10);
            res.status(200).json(recentCheckout); 
        } catch (error) {
            console.log('Error fetching recent checkouts:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalStaff: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalStaff = await StaffData.countDocuments({ hospital_ID });
            res.status(200).json({ totalStaff });
        } catch (error) {
            console.log('Error fetching total staff:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalPatients: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalPatients = await PatientData.countDocuments({ hospital_ID });
            res.status(200).json({ totalPatients });
        } catch (error) {
            console.log('Error fetching total patients:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalAppointments = await BookingAppointment.countDocuments({ hospital_ID });
            res.status(200).json({ totalAppointments });
        } catch (error) {
            console.log('Error fetching total appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalPendingAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalPendingAppointments = await BookingAppointment.countDocuments({ hospital_ID, status: 'pending' });
            res.status(200).json({ totalPendingAppointments });
        } catch (error) {
            console.log('Error fetching total pending appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalCompletedAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalCompletedAppointments = await BookingAppointment.countDocuments({ hospital_ID, status: 'completed' });
            res.status(200).json({ totalCompletedAppointments });
        } catch (error) {
            console.log('Error fetching total completed appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },
}
