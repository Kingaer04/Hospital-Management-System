import HospitalAdminAccount from "../Models/AdminModel.js";
import passport from "passport";
import xlsx from "xlsx";
import jwt from "jsonwebtoken";

function getAdminParams(body) {
    return {
        hospital_Name: body.hospital_Name,
        hospital_Representative: body.hospital_Representative,
        hospital_UID: body.hospital_UID,
        ownership: body.ownership,
        hospital_Email: body.hospital_Email,
        hospital_State: body.hospital_State,
        hospital_Address: body.hospital_Address,
        hospital_Phone: body.hospital_Phone
    }
}

// Function to verify hospital registration and licensing status
const verifyHospitalStatus = (uid) => {

    const workbook = xlsx.readFile('c:/Users/DanAnny/Documents/Final Year Project/Hospital Management System/api/nigeria-hospitals-and-clinics_hxl.xlsx');
    const sheetName = workbook.SheetNames[0]; // Selecting the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON format
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Search for the UID in the data
    const hospital = data.find(row => row.uid == uid);

    if (hospital) {
        // Explicitly check both registration and licensing status
        const isRegistered = hospital.registration_status === 'Registered';
        const isLicensed = hospital.license_status === 'Licensed';

        return {
            registered: isRegistered,
            licensed: isLicensed
        };
    } else {
        return null; // UID not found
    }
};

export const adminController = {
    SignUp: (req, res, next) => {
        const { hospital_UID } = req.body;
        const hospitalStatus = verifyHospitalStatus(hospital_UID);

        if (hospitalStatus) {
            if (hospitalStatus.registered && hospitalStatus.licensed) {
                let newHospital = new HospitalAdminAccount(getAdminParams(req.body));
                console.log('hospital', newHospital);
                HospitalAdminAccount.register(newHospital, req.body.password, (error, hospital) => {
                    if (hospital) {
                        res.status(200).json({
                            message: 'Hospital Account Created Successfully'
                        });
                    } else {
                        res.status(400).json({
                            error: 'Failed to create Hospital Account',
                            message: error.message
                        });
                        next(error);
                    }
                });
            } else {
                return res.status(400).json({
                    error: 'Hospital not registered or licensed.'
                });
            }
        } else {
            return res.status(404).json({
                error: 'No hospital found with the provided UID.'
            });
        }
    },

    authenticate_admin: (req, res, next) => {
        const { hospital_UID } = req.body; // Assuming UID is sent in the request body

        const hospitalStatus = verifyHospitalStatus(hospital_UID);

        if (!hospitalStatus) {
            return res.status(404).json({
                error: 'No hospital found with the provided UID.'
            });
        }

        if (!hospitalStatus.registered || !hospitalStatus.licensed) {
            return res.status(400).json({
                error: 'Hospital not registered or licensed.'
            });
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
            }
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed', error: info.message });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
                }
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                const { hash: has, salt: sal, ...rest } = user._doc;
                res.cookie('token', token, { httpOnly: true }).status(200).json(rest);
            });
        })(req, res, next);
    },

    verifyToken: (req, res, next) => {
        const token = req.cookies.token;

        if (!token) return next(res.status(401).json({ message: 'Unauthorized' }));

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(res.status(403).json({ message: 'Forbidden' }));

            req.user = user;
            next();
        });
    },
};
