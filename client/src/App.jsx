import React from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/privateRoute.jsx'
import SignUp from './pages/sign-up.jsx'
import SignIn from './pages/sign-in.jsx'
import Layout from './components/layout.jsx'
import ReceptionistHome from './pages/receptionistPage.jsx'
import { OpenProvider } from './components/openContext.jsx'
import Patient from './pages/patient.jsx'
import Appointment from './pages/appointment.jsx'
import Home from './pages/home.jsx'
import Settings from './pages/settings.jsx'
import StaffDetails from './pages/staffDetails.jsx'
import RequestPage from './pages/requestPage.jsx'
import StaffProfile from './pages/staffProfile.jsx'
import StaffSignIn from './pages/staffSignIn.jsx'
import DoctorHome from './pages/doctorHome.jsx'
import PatientProfile from './pages/patientProfile.jsx'
import AppointmentForm from './pages/appointment-booking.jsx'
import SendingNotification from './components/sendingNotification.jsx'
import NotificationPage from './pages/notificationPage.jsx'
import NotificationDetail from './pages/notificationBody.jsx'
import {NotificationProvider} from './components/notificationSound.jsx'
import MedicalRecord from './pages/medical-record.jsx'
import HospitalCheckout from './pages/checkout.jsx'
import HospitalPaymentIntegration from './pages/hospitalPayment.jsx'
import ChatInterface from './pages/chatting.jsx'
import useSocketConnection from './components/socketIo.jsx'
// import CustomWebcam from './components/CustomWebcam.jsx' will check the driver of my camera


export default function App() {
  const currentUser = useSelector((state) => state.user)
  useSocketConnection();

  return (
    <div className=''>
        <BrowserRouter>
          <OpenProvider>
          <NotificationProvider>
            <Routes>
              <Route path='/Sign-In' element={<SignIn/>}/>
              <Route path='/Sign-Up' element={<SignUp/>}/>
              <Route path='/Staff-SignIn' element={<StaffSignIn/>}/>
              <Route element={<PrivateRoute/>}>
                <Route element={<Layout/>}>
                    <Route path="/" element={<Navigate to="/home" replace/>}/>
                    <Route path='/home' element={<Home/>}/>
                    <Route path='/Appointment' element={<Appointment/>}/>
                    <Route path='/receptionistHome' element={<ReceptionistHome/>}/>
                    <Route path='/DoctorHome' element={<DoctorHome/>}/>
                    <Route path='/patient' element={<Patient/>}/>
                    <Route path="/patient/edit/:id" element={<PatientProfile />} />
                    <Route path='/details' element={<StaffDetails/>}/>
                    <Route path='/settings' element={<Settings/>}/>
                    <Route path='/request/:id' element={<RequestPage/>}/>
                    <Route path='/profile' element={<StaffProfile/>}/>
                    <Route path='/booking-appointments/:id' element={<AppointmentForm/>}/>
                    <Route path='/send-notification' element={<SendingNotification/>}/>
                    <Route path='/notifications' element={<NotificationPage/>}/>
                    <Route path='/notification-body/:id' element={<NotificationDetail/>}/>
                    <Route path='/medical-record/:patientId' element={<MedicalRecord/>}/>
                    <Route path='/checkout' element={<HospitalCheckout/>}/>
                    <Route path='/payment-integration/:patientId/:appointmentId' element={<HospitalPaymentIntegration/>}/>
                    <Route path='/message' element={<ChatInterface/>}/>
                    {/* <Route path='/webcam' element={<CustomWebcam/>}/> */}
                </Route>
              </Route>
            </Routes>
          </NotificationProvider>
          </OpenProvider>
        </BrowserRouter>
    </div>
  )
}
