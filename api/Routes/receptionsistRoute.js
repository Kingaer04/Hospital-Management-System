import express from 'express'
import { patientController } from '../Controllers/patientController.js';
import { receptionistController } from '../Controllers/receptionistController.js';
import { doctorController } from '../Controllers/doctorController.js';
import { createHospitalSubaccount, generatePaymentLink, verifyPayment, handleWebhook, recordCashPayment } from '../services/paystackService.js'
import { sendEmailToPatient } from '../Controllers/emailController.js';

const router = express.Router();

router.post('/addPatient/:hospital_ID', patientController.addPatient);
router.get('/patientDetails/:hospital_ID', patientController.getAllPatient);
router.get('/patientData/:id', patientController.getPatientData);
router.post('/updatePatientProfile/:hospital_ID/:id', patientController.verifyToken, patientController.updatePatient);
router.post('/searchPatient', patientController.patientSearch);
router.post('/book-appointment/:id', patientController.bookingAppointment)
router.get('/doctorData/:hospital_ID', receptionistController.getDoctors)
router.get('/appointmentData/:hospital_ID', receptionistController.getAllAppointment)
router.get('/fetchFingerprintData/:id', patientController.fetchFingerprintData)
router.get('/fetchHospital/:doctorId', doctorController.getHospital);

// Paystack route
router.post('/hospitals/subaccount', createHospitalSubaccount);
router.post('/invoices/payment-link', generatePaymentLink);
router.get('/payments/verify/:reference', verifyPayment);
router.post('/payments/record-cash', recordCashPayment);
router.post('/webhook', handleWebhook);

// Email routes
router.post('/send-email', sendEmailToPatient);

// Checkout route
router.post('/appointments/update-checkOut/:appointmentId', receptionistController.updateAppointmentCheckOut);


export default router;
