import express from 'express';
import { MedicalRecordController } from '../Controllers/medical-recordController.js';
import { adminController } from '../Controllers/adminController.js';

const router = express.Router();

// Create a new medical record
router.post('/create', adminController.verifyToken, MedicalRecordController.createMedicalRecord)

// Add a consultation to a medical record
router.post('/:medicalRecordId/consultation', adminController.verifyToken, MedicalRecordController.addConsultation);

// Update an existing consultation
router.post('/:medicalRecordId/consultation/:consultationId', adminController.verifyToken, MedicalRecordController.updateConsultation);

// Get a medical record
router.get('/medicalRecords/:patientId', adminController.verifyToken, MedicalRecordController.getMedicalRecord);

// Grant hospital access to a medical record
router.post('/:medicalRecordId/grant-access/:hospitalId', MedicalRecordController.grantHospitalAccess );

export default router;