import express from 'express'
import { adminController } from '../Controllers/adminController.js'

const router = express.Router();

router.post('/SignUp', adminController.SignUp)
router.post('/SignIn', adminController.authenticate_admin)
router.get('/SignOut', adminController.signOut)

export default router;
