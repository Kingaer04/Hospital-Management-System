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
    SignUp: (req, res, next) => {
        if (req.skip) return next();

        let newUser = new Admin(getUserParams(req.body));
        Admin.register(newUser, req.body.password, (error, user) => {
            if (user) {
                res.status(201).json({
                    message: 'User created successfully',
                });
            } else {
                res.status(400).json({
                    error: `Failed to create user account`,
                    message: error.message
                });
                next(error);  // Pass the error to the next middleware
            }
        });

    },
    authenticate: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
            }
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed', error: info.message });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
                }
                const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
                const {hash: has, salt:sal, ...rest} = user._doc
                res.cookie('token', token, {httpOnly: true}).status(200).json(rest)      
            });
            
        })(req, res, next)
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
            res.status(200).json("Admin has logged out!")
        } catch (error) {
            next(error)
        }
    }
}
