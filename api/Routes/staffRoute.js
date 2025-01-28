import express from 'express'
import { authController } from '../Controllers/authController.js';
import { staffController } from '../Controllers/staffController.js';
import { adminController } from '../Controllers/adminController.js';

const router = express.Router();

router.post('/SignIn', authController.authenticate);
router.get('/SignOut', authController.signOut);
router.post('/Update/:id', adminController.verifyToken, staffController.update);

export default router;
