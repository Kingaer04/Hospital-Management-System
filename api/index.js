import express from 'express'
import mongoose from "mongoose"
import dotenv from 'dotenv'
import passport from 'passport'
import session from "express-session" // for cookie session
import cookieParser from "cookie-parser"
import router from './Routes/indexRoute.js'
import HospitalAdminAccount from './Models/AdminModel.js'
import StaffData from './Models/StaffModel.js'

dotenv.config()

const app = express()

app.use(cookieParser("secret_passcode"))
app.use(session({
    secret: "secret_passcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,  // Ensure the cookie is httpOnly for security
        secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
        maxAge: 1000000  // Set the cookie's max age to 1000 seconds
    }
}));
app.use(passport.initialize())
app.use(passport.session()) // Passport to use session that has been setup

passport.use('admin-local', HospitalAdminAccount.createStrategy()) // configure the user's login strategy
passport.serializeUser(HospitalAdminAccount.serializeUser()) // for encrypting
passport.deserializeUser(HospitalAdminAccount.deserializeUser()) //for decrypting

passport.use('staff-local', StaffData.createStrategy()) // configure the user's login strategy
passport.serializeUser(StaffData.serializeUser()) // for encrypting
passport.deserializeUser(StaffData.deserializeUser()) //for decrypting

app.use(express.json())
app.use(express.urlencoded({extended: false}))


const db = mongoose.connection
mongoose.connect(process.env.MONGO)

db.once("open", () => {
    console.log("Database connected successfully!")
})


app.use('/', router)

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), () => {
    console.log(`Server is running on https://localhost/${app.get('port')}`)
}) 
