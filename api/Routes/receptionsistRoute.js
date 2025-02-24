import express from 'express'
import { patientController } from '../Controllers/patientController.js';

const router = express.Router();

router.post('/addPatient/:hospital_ID', patientController.addPatient);
router.get('/patientDetails/:hospital_ID', patientController.getAllPatient);
router.get('/patientData/:id', patientController.getPatientData);
// router.post('/SignIn', adminController.authenticate_admin);
// router.get('/SignOut', adminController.signOut);
// router.post('/updateAccount/:id', adminController.verifyToken, adminController.updateAccount);
// router.post('/addStaff', adminController.addStaff);
// router.put('/updateStaff', adminController.updateStaff);
// router.delete('/deleteStaff/:id', adminController.deleteStaff);
// router.get('/staffDetails/:hospital_ID', adminController.getAllStaff);

export default router;
