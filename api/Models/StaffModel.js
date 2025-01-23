import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    hospital_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdminAccount',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    relationshipStatus: {
        type: String,
        enum: ['Married', 'Single', 'Widow', 'Widower'],
        required: true
    },
    role: {
        type: String,
        enum: ['Receptionist', 'Doctor'],
        required: true
    },
    licenseNumber: {
        type: String,
        required: function() {
            return this.role === 'Doctor';
        }
    },
    nextOfKin: {
        name: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female'],
            required: true
        },
        address: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        relationshipStatus: {
            type: String,
            enum: ['Father', 'Mother', 'Sibling', 'Friend', 'Other Relatives'],
            required: true
        }
    }
}, {
    timestamps: true
});

const StaffData = mongoose.model('StaffData', staffSchema);

export default StaffData;
