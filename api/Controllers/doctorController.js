import HospitalAdminAccount from "../Models/AdminModel.js";
import StaffData from "../Models/StaffModel.js"; 

export const doctorController = {
    getHospital: async (req, res) => {
        try {
            const { doctorId } = req.params;
            
            // First, find the doctor by ID
            const doctorData = await StaffData.findById(doctorId);
            console.log('doctorData', doctorData);
            
            if (!doctorData) {
                return res.status(404).json({ message: "Doctor not found" });
            }
            
            // Get the hospital_ID from the doctor data
            const hospitalId = doctorData.hospital_ID;
            
            // Find the hospital using the hospital_ID
            const hospitalData = await HospitalAdminAccount.findById(hospitalId);
            console.log('hospitalData', hospitalData);
            
            if (!hospitalData) {
                return res.status(404).json({ message: "Hospital not found" });
            }
            
            console.log('hospitalData', hospitalData);
            res.status(200).json(hospitalData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
}