import HospitalAdminAccount from "../Models/AdminModel.js";
import passport from "passport";
import xlsx from "xlsx";
import jwt from "jsonwebtoken";
import StaffData from "../Models/StaffModel.js";

function getAdminParams(body) {
    return {
        avatar: body.avatar,
        hospital_Name: body.hospital_Name,
        hospital_Representative: body.hospital_Representative,
        hospital_UID: body.hospital_UID,
        ownership: body.ownership,
        hospital_Email: body.hospital_Email,
        hospital_Phone: body.hospital_Phone,
        hospital_Address: {
            state: body.hospital_Address.state,
            lga: body.hospital_Address.lga,
            number: body.hospital_Address.number,
            street: body.hospital_Address.street,
        },
    };
}

// Function to verify hospital registration and licensing status
const verifyHospitalStatus = (uid) => {
    const workbook = xlsx.readFile('c:/Users/DanAnny/Documents/Final Year Project/Hospital Management System/api/nigeria-hospitals-and-clinics_hxl.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    const hospital = data.find(row => row.uid == uid);

    if (hospital) {
        const isRegistered = hospital.registration_status === 'Registered';
        const isLicensed = hospital.license_status === 'Licensed';
        return { registered: isRegistered, licensed: isLicensed };
    } else {
        return null; // UID not found
    }
};

const verifyDoctorStatus = (licenseNumber) => {
    // Load the workbook
    const workbook = xlsx.readFile('c:/Users/DanAnny/Documents/Final Year Project/Hospital Management System/api/nigeria-doctors.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert the sheet to JSON format
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    // Find the doctor by license number
    const doctor = data.find(row => row['License Number'] === licenseNumber);

    if (doctor) {
        const expiryDate = new Date(doctor['Expiry Date']);
        const today = new Date();
        
        if (expiryDate > today) {
            return { valid: true, message: 'License is valid and not expired.' };
        } else {
            return { valid: false, message: 'License has expired.' };
        }
    } else {
        return { valid: false, message: 'License number not found.' }; // License number not found
    }
};

export const adminController = {
    SignUp: (req, res, next) => {
        const { hospital_UID } = req.body;
        const hospitalStatus = verifyHospitalStatus(hospital_UID);

        if (hospitalStatus) {
            if (hospitalStatus.registered && hospitalStatus.licensed) {
                let newHospital = new HospitalAdminAccount(getAdminParams(req.body));
                HospitalAdminAccount.register(newHospital, req.body.password, (error, hospital) => {
                    if (hospital) {
                        res.status(200).json({ message: 'Hospital Account Created Successfully' });
                    } else {
                        res.status(400).json({ error: 'Failed to create Hospital Account', message: error.message });
                        next(error);
                    }
                });
            } else {
                return res.status(400).json({ error: 'Hospital not registered or licensed.' });
            }
        } else {
            return res.status(404).json({ error: 'No hospital found with the provided UID.' });
        }
    },

    authenticate_admin: (req, res, next) => {
        const { hospital_UID } = req.body;
        const hospitalStatus = verifyHospitalStatus(hospital_UID);

        if (!hospitalStatus) {
            return res.status(404).json({ error: 'No hospital found with the provided UID.' });
        }

        if (!hospitalStatus.registered || !hospitalStatus.licensed) {
            return res.status(400).json({ error: 'Hospital not registered or licensed.' });
        }

        passport.authenticate('admin-local', (err, user, info) => {
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
                const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET); // Include role
                const { hash: has, salt: sal, ...rest } = user._doc;
                res.cookie('token', token, { httpOnly: true }).status(200).json(rest);
            });
        })(req, res, next);
    },

    verifyToken: (req, res, next) => {
        const token = req.cookies.token;

        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });

            req.user = user;
            next();
        });
    },

    signOut: async (req, res, next) => {
        try {
            res.clearCookie('token');
            res.status(200).json("Admin has logged out!");
        } catch (error) {
            next(error);
        }
    },

    updateAccount: async (req, res, next) => {
        try {
            if (req.user.id !== req.params.id) {
                return res.status(401).json({ error: 'Unauthorized! You can only update your account' });
            }
            console.log(req.body.oldPassword)
            // Get the current user before updating
            const currentUser = await HospitalAdminAccount.findById(req.user.id);
            if (!currentUser) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update user with provided fields
            const updatedUser = await HospitalAdminAccount.findByIdAndUpdate(req.user.id, {
                $set: getAdminParams(req.body) // Ensure this function extracts the right fields
            }, { new: true });
    
            // Check if both old and new passwords are provided
            if (req.body.oldPassword && req.body.newPassword) {
                try {
                    await currentUser.changePassword(req.body.oldPassword, req.body.newPassword);
                } catch (error) {
                    return res.status(400).json({ error: 'Old password is incorrect' });
                }
            } else if (req.body.oldPassword || req.body.newPassword) {
                return res.status(400).json({ error: 'Both old and new passwords must be provided.' });
            }
    
            // After updating the user, return the complete user object
            const fullUser = await HospitalAdminAccount.findById(req.user.id);
            res.status(200).json(fullUser);
        } catch (error) {
            next(error);
        }
    },

    // Staff management functions
    addStaff: async (req, res, next) => {
        try {
            const { hospital_ID, email, phone, role, licenseNumber } = req.body; // Extract role and license number
    
            // Check if a staff member with the same email or phone already exists
            const existingStaff = await StaffData.findOne({
                $or: [{ email }, { phone }],
            });
    
            if (existingStaff) {
                return res.status(400).json({
                    error: 'Staff member already exists',
                    message: 'A staff member with this email or phone number already exists.',
                });
            }
    
            // If the role is 'doctor', verify the license number
            if (role === 'doctor') {
                const verificationResult = verifyDoctorStatus(licenseNumber);
                if (!verificationResult.valid) {
                    return res.status(400).json({
                        error: 'Invalid license number',
                        message: verificationResult.message,
                    });
                }
            }
    
            const newStaff = new StaffData({
                hospital: hospital_ID,
                ...req.body,
            });
    
            StaffData.register(newStaff, req.body.phone, (error, staffData) => {
                if (staffData) {
                    res.status(200).json({ message: 'Staff added successfully' });
                } else {
                    res.status(400).json({ error: 'Failed to add staff', message: error.message });
                    next(error);
                }
            });
        } catch (error) {
            res.status(400).json({ error: 'Failed to add staff', message: error.message });
            next(error);
        }
    },

    getAllStaff: async (req, res, next) => {
        try {
            const { hospital_ID } = req.params
            console.log(hospital_ID);
            const staffMembers = await StaffData.find({ hospital_ID: hospital_ID });
            console.log(staffMembers);
            res.status(200).json({ staff: staffMembers });
            // res.json(staffMembers)
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
