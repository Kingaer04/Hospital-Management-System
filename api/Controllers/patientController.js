import jwt from "jsonwebtoken";
import PatientData from "../Models/PatientModel.js";

function getPatientParams(body) {
    return {
        hospital_ID: body.hospital_ID,
        first_name: body.first_name,
        last_name: body.last_name,
        gender: body.gender,
        address: body.address,
        phone: body.phone,
        email: body.email,
        avatar: body.avatar,
        fingerprintImage: body.fingerprint_Data,
        access_key: body.access_code,
        DoB: body.patientDoB,
        relationshipStatus: body.relationshipStatus,
        nextOfKin: {
            name: body.nextOfKin.name,
            gender: body.nextOfKin.gender,
            address: body.nextOfKin.address,
            phone: body.nextOfKin.phone,
            relationshipStatus: body.nextOfKin.relationshipStatus
        },
    };
}


export const patientController = {
    verifyToken: (req, res, next) => {
        const token = req.cookies.token;

        if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                // If token is invalid or expired, call signOut
                return signOut(req, res, next);
            }
    
            req.user = user;
            next();
        });
    },

    addPatient: async (req, res, next) => {
        try {
            const hospital_ID = req.params.hospital_ID
            const { email, phone } = req.body; 
            console.log(hospital_ID)
            // Check if a patient with the same email or phone already exists
            const existingPatient = await PatientData.findOne({
                $or: [{ email }, { phone }],
            });
    
            if (existingPatient) {
                return res.status(400).json({
                    error: 'Patient already exists',
                    message: 'A Patient with this email or phone number already exists.',
                });
            }
    
            const newPatient = new PatientData({
                hospital: hospital_ID,
                ...getPatientParams(req.body),
            });
    
            await newPatient.save();

            return res.status(201).json({
                message: 'Patient added successfully'
            })
        } catch (error) {
            res.status(400).json({ error: 'Failed to add patient', message: error.message });
            next(error);
        }
    },

    getPatientData: async (req, res, next) => {
        try {
            const { id } = req.params
            const patient = await PatientData.findById(id);
            res.status(200).json({ patient: patient });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve patient', message: error.message });
            next(error);
        }
    },

    getAllPatient: async (req, res, next) => {
        try {
            const { hospital_ID } = req.params
            const patients = await PatientData.find({ hospital_ID: hospital_ID });
            res.status(200).json({ patient: patients });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve staff', message: error.message });
            next(error);
        }
    },

    updateStaff: async (req, res, next) => {
        try {
            const { staffId } = req.params;
            const { role } = req.body; // Only role should be updated
            const { role: adminRole, hospitalId } = req.user; // Assuming role and hospitalId are included in the JWT payload

            // Check if the admin has permission
            if (adminRole !== 'Admin') {
                return res.status(403).json({ error: 'Only admins can update staff roles' });
            }

            const staff = await StaffData.findById(staffId);
            if (!staff || staff.hospital.toString() !== hospitalId) {
                return res.status(404).json({ error: 'Staff not found or you do not have permission to update this staff' });
            }

            staffData.role = role; // Update the staff role
            await staff.save();

            res.status(200).json({ message: 'Staff role updated successfully', staff });
        } catch (error) {
            res.status(400).json({ error: 'Failed to update staff role', message: error.message });
            next(error);
        }
    },

    deleteStaff: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { role, hospital_ID } = req.body; 

            if (role !== 'Admin') {
                return res.status(403).json({ error: 'Only admins can delete staff' });
            }

            const staff = await StaffData.findById(id);
            if (!staff || staff.hospital_ID.toString() !== hospital_ID) {
                return res.status(404).json({ error: 'Staff not found or you do not have permission to delete this staff' });
            }

            await StaffData.findByIdAndDelete(id);
            res.status(200).json({ message: 'Staff deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: 'Failed to delete staff', message: error.message });
            next(error);
        }
    }
};
