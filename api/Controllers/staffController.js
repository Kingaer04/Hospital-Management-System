import passport from 'passport'
import jwt from 'jsonwebtoken'
import StaffData from '../Models/StaffModel.js'

function getUserParams(body) {
    return {
        name: body.name,
        email: body.email,
        role: body.role,
        avatar: body.avatar,
        phone: body.phone,
        address: body.address,
        gender: body.gender,
        relationshipStatus: body.relationshipStatus,
        licenseNumber: body.licenseNumber,
        nextOfKin: {
            name: body.nextOfKin?.name,
            gender: body.nextOfKin?.gender,
            address: body.nextOfKin?.address,
            email: body.nextOfKin?.email,
            phone: body.nextOfKin?.phone,
            relationshipStatus: body.nextOfKin?.relationshipStatus,
        },
        hospital_ID: body.hospital_ID // If you want to include hospital_ID as well
    };
}