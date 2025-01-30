import mongoose from "mongoose";
import { type } from "os";
import passportLocalMongoose from 'passport-local-mongoose';

const AdminSchema = new mongoose.Schema({
    hospital_Name: {
        type: String,
        required: true
    },
    hospital_Representative: {
        type: String,
        required: true
    },
    hospital_UID: {
        type: String,
        unique: true,
        required: true
    },
    ownership: {
        type: String,
        required: true
    },
    hospital_Email: {
        type: String,
        unique: true,
        required: true
    },
    hospital_State: {
        type: String,
        required: true
    },
    hospital_Address: {
        state: {
            type: String,
            required: true
        },
        lga: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    },
    hospital_Phone: {
        type: String,
        unique: true,
        required: true
    },
    hospital_Avatar: {
        type: String
    },
    role: {
        type: String,
        default: "Admin"
    },
    avatar: {
        type: String,
    }
}, {timestamps: true})

AdminSchema.plugin(passportLocalMongoose, {
    usernameField: "hospital_Email"
})

const HospitalAdminAccount = mongoose.model('HospitalAdminAccount', AdminSchema);

export default HospitalAdminAccount;
