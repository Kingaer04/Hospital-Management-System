import StaffData from '../Models/StaffModel.js'
import BookingAppointment from '../Models/BoookingAppointmentModel.js';
import PatientData from '../Models/PatientModel.js';
import { get } from 'http';

export const receptionistController = {
    getDoctors: async (req, res) => {
        try {
            const doctors = await StaffData.find({ hospital_ID: req.params.hospital_ID, role: 'Doctor', availability_Status: true });
            res.status(200).json(doctors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllAppointment: async (req, res) => {
        try {
            const appointment_bookings = await BookingAppointment.find({ hospital_ID: req.params.hospital_ID }).populate('patientId', 'first_name last_name email phone avatar').populate('doctorId', 'name email phone');
            console.log(appointment_bookings);
            res.status(200).json(appointment_bookings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateAppointmentCheckOut: async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { checkOut } = req.body;
            
            if (!checkOut) {
                return res.status(400).json({ message: 'checkOut is required' });
            }
            
            // First fetch the appointment
            const appointment = await BookingAppointment.findById(appointmentId);
            
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            
            // Check if the status is already set to the requested value
            if (appointment.checkOut === checkOut) {
                return res.status(200).json({ 
                message: 'Appointment checkOut already set to ' + checkOut,
                appointment 
                });
            }
        
            // Log the status change (optional)
            console.log(`Appointment ${appointmentId} status changing from ${appointment.checkOut} to ${checkOut}`);
        
            // Update the status
            appointment.checkOut = new Date();
            
            // Save the changes
            await appointment.save();
            
            res.status(200).json(appointment);
        } 
        catch (error) {
            console.error('Error updating appointment checkOut:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getRecentCheckouts: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const recentCheckout = await BookingAppointment.find({ hospital_ID, checkOut: { $exists: true , $ne: null} })
                .populate('patientId', 'first_name last_name email phone avatar')
                .populate('doctorId', 'name email phone')
                .sort({ checkOut: -1 })
                .limit(10);
            res.status(200).json(recentCheckout); 
        } catch (error) {
            console.log('Error fetching recent checkouts:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalStaff: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalStaff = await StaffData.countDocuments({ hospital_ID });
            res.status(200).json({ totalStaff });
        } catch (error) {
            console.log('Error fetching total staff:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalPatients: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalPatients = await PatientData.countDocuments({ hospital_ID });
            res.status(200).json({ totalPatients });
        } catch (error) {
            console.log('Error fetching total patients:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalAppointments = await BookingAppointment.countDocuments({ hospital_ID });
            res.status(200).json({ totalAppointments });
        } catch (error) {
            console.log('Error fetching total appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalPendingAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalPendingAppointments = await BookingAppointment.countDocuments({ hospital_ID, status: 'pending' });
            res.status(200).json({ totalPendingAppointments });
        } catch (error) {
            console.log('Error fetching total pending appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getTotalCompletedAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const totalCompletedAppointments = await BookingAppointment.countDocuments({ hospital_ID, status: 'completed' });
            res.status(200).json({ totalCompletedAppointments });
        } catch (error) {
            console.log('Error fetching total completed appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getMonthlyPatients: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            
            // Get the current year
            const currentYear = new Date().getFullYear();
            
            // Aggregate the monthly data for the current year
            const monthlyData = await PatientData.aggregate([
                {
                    $match: { 
                        hospital_ID,
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { 
                            month: { $month: "$createdAt" },
                            registered: { $cond: [{ $eq: ["$is_registered", true] }, "registered", "unregistered"] }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.month": 1 } }
            ]);
            
            // Transform into the format expected by frontend
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const formattedData = months.map((month, index) => {
                const registeredCount = monthlyData.find(item => 
                    item._id.month === index + 1 && item._id.registered === "registered"
                )?.count || 0;
                
                const unregisteredCount = monthlyData.find(item => 
                    item._id.month === index + 1 && item._id.registered === "unregistered"
                )?.count || 0;
                
                return {
                    month,
                    registeredPatients: registeredCount,
                    unregisteredPatients: unregisteredCount
                };
            });
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.log('Error fetching monthly patients:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getMonthlyRevenue: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            
            // Get the current year
            const currentYear = new Date().getFullYear();
            
            // Aggregate the monthly revenue for the current year
            const monthlyData = await BookingAppointment.aggregate([
                {
                    $match: { 
                        hospital_ID,
                        status: 'completed',
                        paymentStatus: 'paid',
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        amount: { $sum: "$appointmentFee" }
                    }
                },
                { $sort: { "_id.month": 1 } }
            ]);
            
            // Transform into the format expected by frontend
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const formattedData = months.map((month, index) => {
                const monthData = monthlyData.find(item => item._id.month === index + 1);
                return {
                    month,
                    amount: monthData ? monthData.amount : 0
                };
            });
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.log('Error fetching monthly revenue:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getDoctorsWithMostAppointments: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            
            // Define the colors for different doctors (for pie chart visualization)
            const colors = [
                '#00A272', '#34C89A', '#7BE3C3', '#B6F2E4', '#D8F9F1',
                '#4C9E81', '#2B6F5A', '#9AD6C2', '#5FB898', '#85CCAE'
            ];
            
            // Aggregate doctors by appointment count
            const doctorData = await BookingAppointment.aggregate([
                {
                    $match: { hospital_ID }
                },
                {
                    $group: {
                        _id: "$doctorId",
                        value: { $sum: 1 }
                    }
                },
                {
                    $sort: { value: -1 }
                },
                {
                    $limit: 5 // Limit to top 5 doctors
                },
                {
                    $lookup: {
                        from: "staffs", // assuming your staff collection name
                        localField: "_id",
                        foreignField: "_id",
                        as: "doctorInfo"
                    }
                },
                {
                    $unwind: {
                        path: "$doctorInfo",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        value: 1,
                        name: { $ifNull: ["$doctorInfo.name", "Unknown Doctor"] }
                    }
                }
            ]);
            
            // Transform into the format expected by frontend
            const formattedData = doctorData.map((item, index) => ({
                name: item.name,
                value: item.value,
                color: colors[index % colors.length] // Cycle through colors
            }));
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.log('Error fetching doctors with most appointments:', error);
            res.status(500).json({ message: error.message });
        }
    },
    
    // New API endpoints to match frontend requirements

    // API to get doctors for the hospital
    getDoctorsForHospital: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            
            const doctors = await StaffData.find({ 
                hospital_ID, 
                role: 'Doctor'
            });
            
            res.status(200).json(doctors);
        } catch (error) {
            console.log('Error fetching doctors:', error);
            res.status(500).json({ message: error.message });
        }
    },
    
    // For monthly reports by year
    getPatientsByYear: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const { year } = req.query;
            
            // Default to current year if not specified
            const selectedYear = year ? parseInt(year) : new Date().getFullYear();
            
            // Aggregate the monthly data for the selected year
            const monthlyData = await PatientData.aggregate([
                {
                    $match: { 
                        hospital_ID,
                        createdAt: {
                            $gte: new Date(`${selectedYear}-01-01`),
                            $lte: new Date(`${selectedYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { 
                            month: { $month: "$createdAt" },
                            registered: { $cond: [{ $eq: ["$is_registered", true] }, "registered", "unregistered"] }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.month": 1 } }
            ]);
            
            // Transform into the format expected by frontend
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const formattedData = months.map((month, index) => {
                const registeredCount = monthlyData.find(item => 
                    item._id.month === index + 1 && item._id.registered === "registered"
                )?.count || 0;
                
                const unregisteredCount = monthlyData.find(item => 
                    item._id.month === index + 1 && item._id.registered === "unregistered"
                )?.count || 0;
                
                return {
                    month,
                    registeredPatients: registeredCount,
                    unregisteredPatients: unregisteredCount
                };
            });
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.log('Error fetching patients by year:', error);
            res.status(500).json({ message: error.message });
        }
    },
    
    getRevenueByYear: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            const { year } = req.query;
            
            // Default to current year if not specified
            const selectedYear = year ? parseInt(year) : new Date().getFullYear();
            
            // Aggregate the monthly revenue for the selected year
            const monthlyData = await BookingAppointment.aggregate([
                {
                    $match: { 
                        hospital_ID,
                        status: 'completed',
                        paymentStatus: 'paid',
                        createdAt: {
                            $gte: new Date(`${selectedYear}-01-01`),
                            $lte: new Date(`${selectedYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        amount: { $sum: "$appointmentFee" }
                    }
                },
                { $sort: { "_id.month": 1 } }
            ]);
            
            // Transform into the format expected by frontend
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const formattedData = months.map((month, index) => {
                const monthData = monthlyData.find(item => item._id.month === index + 1);
                return {
                    month,
                    amount: monthData ? monthData.amount : 0
                };
            });
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.log('Error fetching revenue by year:', error);
            res.status(500).json({ message: error.message });
        }
    },
    
    // Get top doctors - renamed to match frontend API call
    getTopDoctors: async (req, res) => {
        try {
            const { hospital_ID } = req.params;
            
            // Define the colors for different doctors (for pie chart visualization)
            const colors = [
                '#00A272', '#34C89A', '#7BE3C3', '#B6F2E4', '#D8F9F1',
                '#4C9E81', '#2B6F5A', '#9AD6C2', '#5FB898', '#85CCAE'
            ];
            
            // Aggregate doctors by appointment count
            const doctorData = await BookingAppointment.aggregate([
                {
                    $match: { hospital_ID }
                },
                {
                    $group: {
                        _id: "$doctorId",
                        value: { $sum: 1 }
                    }
                },
                {
                    $sort: { value: -1 }
                },
                {
                    $limit: 5 // Limit to top 5 doctors
                },
                {
                    $lookup: {
                        from: "staffs", // assuming your staff collection name
                        localField: "_id",
                        foreignField: "_id",
                        as: "doctorInfo"
                    }
                },
                {
                    $unwind: {
                        path: "$doctorInfo",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        value: 1,
                        name: { $ifNull: ["$doctorInfo.name", "Unknown Doctor"] }
                    }
                }
            ]);
            
            // Transform into the format expected by frontend
            const formattedData = doctorData.map((item, index) => ({
                name: item.name,
                value: item.value,
                color: colors[index % colors.length] // Cycle through colors
            }));
            
            res.status(200).json(formattedData);
        } catch (error) {
            console.log('Error fetching top doctors:', error);
            res.status(500).json({ message: error.message });
        }
    }
}
