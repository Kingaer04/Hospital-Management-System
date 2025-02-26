import mongoose from 'mongoose'

const BookingAppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientData',
        required: true
    },
    hospital_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdminAccount',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffData',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        default: null
    }
})

const BookingAppointment = mongoose.model('BookingAppointment', BookingAppointmentSchema)

export default BookingAppointment
