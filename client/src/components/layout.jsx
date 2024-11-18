import React, {useState} from 'react'
import { Box, useMediaQuery } from "@mui/material"
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MainNavBar from './navbar.jsx'
import SideBar from "./sidebar.jsx"

export default function Layout() {
    const isNonMobile = useMediaQuery("(min-width: 600px)")
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  return (
    <Box 
      display={isNonMobile ? "flex" : ""}
      width="100%"
      height="100%"
    >
        <SideBar 
          isNonMobile={isNonMobile} 
          drawerWidth="250px"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
    </Box>
  )
}
