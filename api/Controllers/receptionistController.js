import Admin from '../models/admin.js'
import passport from 'passport'
import jwt from 'jsonwebtoken'

function getUserParams(body) {
    return {
        userName:  body.userName,
        email: body.email,
        role: body.role,
        avatar: body.avatar,
        phone: body.phone,
        department: body.department,
        address: body.address
    }
}

export const adminController = {
    verifyToken: (req, res, next) => {
        const token = req.cookies.token

        if(!token) return next(res.status(401).json({message: 'Unauthorized'}))

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(res.status(403).json({message:'forbidden'}))
            
            req.user = user
            next()
        })
    },
    // will have access to updating patient record
    update: async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) return res.status(401).json({ error: 'Unauthorized! you can only update your account' });

        const updatedUser = await Admin.findByIdAndUpdate(req.user.id, {
            $set: getUserParams(req.body)
        }, { new: true })

        // Check if both old and new passwords are provided
        if (req.body.oldPassword && req.body.newPassword) {
            try {
                await updatedUser.changePassword(req.body.oldPassword, req.body.newPassword);
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }
        } else if (req.body.oldPassword || req.body.newPassword) {
            return res.status(400).json({ error: 'Both old and new passwords must be provided.' });
        }
        updatedUser.changePassword = async function(oldPassword, newPassword) {
            // Check if the old password matches the one in the database
            const isMatch = await this.comparePassword(oldPassword);
            if (!isMatch) {
                throw new Error('Old password is incorrect');
            }
        
            // Update the password
            this.password = newPassword;
            await this.save();
        }

        res.status(200).json(updatedUser);
        } catch (error) {
        next(error);
        }
    },
    getPatientRecord: async(req, res) => {
        try {
            const {id} = req.params
            const user = await Admin.findById(id)
            res.status(200).json(user)
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
    },
}

