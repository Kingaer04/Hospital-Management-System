import express from 'express';
import adminRoute from './adminRoute.js';
import staffRoute from './staffRoute.js';

const router = express.Router();

router.use('/admin', adminRoute);
router.use('/staff', staffRoute);

export default router;