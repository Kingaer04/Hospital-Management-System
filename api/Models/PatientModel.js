import mongoose from 'mongoose'
import { type } from 'os';

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
                enum: ['Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other Relatives'],
                required: true
            }
        }
    },{
        timestamps: true
    });

// Pre-save middleware to update the lastUpdatedBy Doctor and name of the hospital
PatientSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdatedBy = {
            doctorId: this.doctorId, 
            doctorName: this.doctorName,
            hospital_name: this.hospital_ID 
        };
    }
    next();
});

const PatientData = mongoose.model('PatientData', PatientSchema);

export default PatientData;