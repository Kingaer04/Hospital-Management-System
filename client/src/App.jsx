import React from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/privateRoute.jsx'
import SignUp from './pages/sign-up.jsx'
import SignIn from './pages/sign-in.jsx'
import Layout from './components/layout.jsx'
import Home from './pages/home.jsx'
import Profile from './pages/profile.jsx'
import { OpenProvider } from './components/openContext.jsx'


export default function App() {
  const currentUser = useSelector((state) => state.user)

  return (
    <div className=''>
        <BrowserRouter>
          <OpenProvider>
            <Routes>
              <Route path='/Sign-In' element={<SignIn/>}/>
              <Route path='/Sign-Up' element={<SignUp/>}/>
              {/* <Route element={<PrivateRoute/>}> */}
                <Route element={<Layout/>}>
                  <Route path="/" element={<Navigate to="/home" replace/>}/>
                  <Route path='/home' element={<Home/>}/>
                  <Route path='/profile' element={<Profile/>}/>
                </Route>
              {/* </Route> */}
            </Routes>
          </OpenProvider>
        </BrowserRouter>
    </div>
  )
}