import express from 'express'
import { doctorController } from '../Controllers/doctorController.js';

const router = express.Router();

router.get('/fetchHospital', doctorController.getHospital);

export default router;
