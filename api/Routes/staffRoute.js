import express from 'express'
import { authController } from '../Controllers/authController.js';

const router = express.Router();

router.post('/SignIn', authController.authenticate);
router.get('/SignOut', authController.signOut);

export default router;
