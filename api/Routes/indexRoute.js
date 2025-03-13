import express from 'express';
import adminRoute from './adminRoute.js';
import staffRoute from './staffRoute.js';
import receptionsistRoute from './receptionsistRoute.js'
import medicalRecordRoute from './medicalRecordRoute.js';
import doctorRoute from './doctorRoute.js'

const router = express.Router();

router.use('/admin', adminRoute);
router.use('/staff', staffRoute);
router.use('/recep-patient', receptionsistRoute);
router.use('/doctor-fetch', doctorRoute);
router.use('/records', medicalRecordRoute);

export default router;