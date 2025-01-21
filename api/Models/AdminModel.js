import mongoose from "mongoose";
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
        type: String,
        unique: true,
        required: true
    },
    hospital_Phone: {
        type: Number,
        unique: true,
        required: true
    },
    hospital_Avatar: {
        type: String
    }, 
}, {timestamps: true})

AdminSchema.plugin(passportLocalMongoose, {
    usernameField: "hospital_Email"
})

const HospitalAdminAccount = mongoose.model('HospitalAdminAccount', AdminSchema);

export default HospitalAdminAccount;
