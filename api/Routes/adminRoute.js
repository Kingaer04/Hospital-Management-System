import express from 'express'
import { adminController } from '../Controllers/adminController.js'

const router = express.Router();

router.post('/SignUp', adminController.SignUp);
router.post('/SignIn', adminController.authenticate_admin);
router.get('/SignOut', adminController.signOut);
router.post('/updateAccount/:id', adminController.verifyToken, adminController.updateAccount);
router.post('/addStaff', adminController.addStaff);
router.put('/updateStaff', adminController.updateStaff);
router.delete('/deleteStaff/:id', adminController.deleteStaff);
router.get('/staffDetails/:hospital_ID', adminController.getAllStaff);

export default router;
