import express from 'express';
import adminRoute from './adminRoute.js';

const router = express.Router();

router.use('/admin', adminRoute);

export default router;