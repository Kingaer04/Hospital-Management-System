import StaffData from '../Models/StaffModel.js'
import BookingAppointment from '../Models/BoookingAppointmentModel.js';

export const receptionistController = {
    getDoctors: async (req, res) => {
        try {
            const doctors = await StaffData.find({ hospital_ID: req.params.hospital_ID, role: 'Doctor' });
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
}