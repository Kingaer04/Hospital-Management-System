import express from 'express';
import adminRoute from './adminRoute.js';
import staffRoute from './staffRoute.js';
import receptionsistRoute from './receptionsistRoute.js'
import medicalRecordRoute from './medicalRecordRoute.js';

const router = express.Router();

router.use('/admin', adminRoute);
router.use('/staff', staffRoute);
router.use('/recep-patient', receptionsistRoute);
router.use('/Records', medicalRecordRoute);

export default router;