import mongoose from 'mongoose'

const PatientSchema = new mongoose.Schema({
    hospital_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdminAccount',
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    patientID: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    DoB: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    relationshipStatus: {
        type: String,
        enum: ['Married', 'Single', 'Widow', 'Widower'],
        required: true
    },
    avatar: {
        type: String,
    },
    fingerprintImage: {
        type: String,
        required: true
    },
    access_key: {
        type: String,
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
        phone: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            unique: true
        },
        relationshipStatus: {
            type: String,
            enum: ['Father', 'Mother', 'Spouse', 'Sister',  'Brother', 'Sibling', 'Child', 'Friend', 'Others'],
            required: true
        }
    }
},{
    timestamps: true
});

const PatientData = mongoose.model('PatientData', PatientSchema);

export default PatientData;