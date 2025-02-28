const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    receptionist_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffData',
        required: true
    },
    doctor_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffData',
        required: true
    },
    patient_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientData',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    Read: {
        type: Boolean,
        default: false
    },
}, {timestamps: true})

const NotificationData = mongoose.model('NotificationData', notificationSchema)

module.exports = {NotificationData}
