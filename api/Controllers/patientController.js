import jwt from "jsonwebtoken";
import PatientData from "../Models/PatientModel.js";
import BookingAppointment from "../Models/BoookingAppointmentModel.js";

function getPatientParams(body) {
    return {
        hospital_ID: body.hospital_ID,
        first_name: body.first_name,
        last_name: body.last_name,
        gender: body.gender,
        patientID: body.patientID,
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
            email: body.nextOfKin.email,
            phone: body.nextOfKin.phone,
            relationshipStatus: body.nextOfKin.relationshipStatus
        },
    };
}


export const patientController = {
    verifyToken: (req, res, next) => {
        const token = req.cookies.token;
        console.log(token)

        if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                // If token is invalid or expired, call signOut
                return signOut(req, res, next);
            }
    
            req.user = user;
            console.log(req.user)
            // console.log(req.user)
            next();
        });
    },

    getLastPatientId: async (req, res) => {
        try {
            console.log(req.params.hospitalId);
            
            // Get the last patient ID from any hospital (global search)
            const lastPatient = await PatientData.findOne(
                {}, 
                { patientID: 1 }
            ).sort({ createdAt: -1 });
    
            // Alternative if you're using numeric IDs
            // const lastPatient = await PatientData.findOne({})
            //    .sort({ patientID: -1 })
            //    .select('patientID');
    
            const lastPatientId = lastPatient ? lastPatient.patientID : null;
            res.json({ lastPatientId });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve last patient ID' });
        }
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
                message: 'Patient added successfully',
                patientData: newPatient._doc
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

    updatePatient: async (req, res, next) => {
        try {
            console.log(req.user)
            if (req.user.hospitalId !== req.params.hospital_ID) return res.status(401).json({ error: 'Unauthorized! you can only update patient that is registered in your hospital' });
            const updatedUser = await PatientData.findByIdAndUpdate(req.params.id, {
                $set: getPatientParams(req.body)
            }, { new: true });
    
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    },

    patientSearch: async (req, res, next) => {
        try {
            const { query } = req.body;
            const results = await PatientData.find({
                $or: [{ phone: query }, { email: query }, { patientID: query }]
            })
            .populate('hospital_ID', 'hospital_Name hospital_Address') // Populate with hospital name and address
            .lean(); // Use .lean() for plain objects
    
            // Format the results to include hospital details
            const formattedResults = results.map(patient => {
                const hospitalAddress = patient.hospital_ID?.hospital_Address;
                const fullAddress = hospitalAddress ? 
                    `${hospitalAddress.number}, ${hospitalAddress.street}, ${hospitalAddress.lga}, ${hospitalAddress.state}` : 
                    'Address not available';
    
                return {
                    ...patient,
                    hospitalName: patient.hospital_ID?.name,
                    hospitalAddress: fullAddress
                };
            });
    
            res.status(200).json(formattedResults);
        } catch (error) {
            next(error); // Pass the error to the error handling middleware
        }
    },

    bookingAppointment: async (req, res, next) => {
        try {
            const { patientId, hospital_ID, doctorId, reason, status, checkIn, checkOut } = req.body;
            const newAppointment = new BookingAppointment({
                patientId,
                hospital_ID,
                doctorId,
                reason,
                status,
                checkIn,
                checkOut
            });
    
            await newAppointment.save();
            res.status(201).json({ message: 'Appointment booked successfully' });
        } catch (error) {
            res.status(400).json({ error: 'Failed to book appointment', message: error.message });
            next(error);
        }
    },

    fetchFingerprintData: async (req, res, next) => {
        try {
            const { id } = req.params;
            const patient = await PatientData
                .findById(id)
                .select('fingerprintImage');
            res.status(200).json({ fingerprintData: patient.fingerprintImage });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve fingerprint data', message: error.message });
            next(error);
        }
    }
};
