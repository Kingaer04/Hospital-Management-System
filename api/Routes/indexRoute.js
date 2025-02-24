import express from 'express';
import adminRoute from './adminRoute.js';
import staffRoute from './staffRoute.js';
import receptionsistRoute from './receptionsistRoute.js'

const router = express.Router();

router.use('/admin', adminRoute);
router.use('/staff', staffRoute);
router.use('/receptionist', receptionsistRoute);

export default router;