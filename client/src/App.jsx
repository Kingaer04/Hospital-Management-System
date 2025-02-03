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


export default function App() {
  const currentUser = useSelector((state) => state.user)

  return (
    <div className=''>
        <BrowserRouter>
          <OpenProvider>
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
                  <Route path='/details' element={<StaffDetails/>}/>
                  <Route path='/settings' element={<Settings/>}/>
                  <Route path='/request' element={<RequestPage/>}/>
                  <Route path='/profile' element={<StaffProfile/>}/>
                </Route>
              </Route>
            </Routes>
          </OpenProvider>
        </BrowserRouter>
    </div>
  )
}