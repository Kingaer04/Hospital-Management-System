import express from 'express'
import { adminController } from '../Controllers/adminController.js'

const router = express.Router();

router.post('/signUp', adminController.SignUp)
router.post('/signIn', adminController.authenticate_admin)

export default router;
