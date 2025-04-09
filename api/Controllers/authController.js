import passport from 'passport'
import jwt from 'jsonwebtoken'
import StaffData from '../Models/StaffModel.js';

export const authController = {
    authenticate: (req, res, next) => {
        passport.authenticate('staff-local', async (err, user, info) => {
          if (err) {
            return res.status(500).json({ message: 'Internal Server Error', error: err.message });
          }
          if (!user) {
            return res.status(401).json({ message: 'Authentication failed', error: info.message });
          }
          
          try {
            // Update user status to Online
            await StaffData.findByIdAndUpdate(user._id, {
              status: 'Online',
              lastSeen: new Date()
            });
            
            req.logIn(user, (err) => {
              if (err) {
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
              }
              
              const token = jwt.sign(
                {id: user._id, role: user.role, hospitalId: user.hospital_ID}, 
                process.env.JWT_SECRET
              );
              
              const {hash: has, salt: sal, ...rest} = user._doc;
              
              // Send response with updated user data and token cookie
              res.cookie('token', token, {httpOnly: true})
                 .status(200)
                 .json({...rest, status: 'Online'});
            });
          } catch (updateErr) {
            return res.status(500).json({ 
              message: 'Failed to update user status', 
              error: updateErr.message 
            });
          }
        })(req, res, next);
    },
    verifyToken: (req, res, next) => {
        const token = req.cookies.token

        if(!token) return next(res.status(401).json({message: 'Unauthorized'}))

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(res.status(403).json({message:'forbidden'}))
            
            req.user = user
            next()
        })
    },
    signOut: async (req, res, next) => {
        try {
            res.clearCookie('token')
            res.status(200).json("Staff has logged out!")
        } catch (error) {
            next(error)
        }
    }
}
