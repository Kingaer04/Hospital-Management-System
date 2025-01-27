import { Box, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LineChart from '../components/lineChart.jsx';
import BarChart from '@/components/barChart';
import GaugeCard from '@/components/patientGauge';
import SalesRecordGauge from '@/components/salesRecordGauge';
import AppointmentSignals from '@/components/pieChart';
import PerformanceGauge from '@/components/performanceGauge';
import { resetWelcomeMessage } from '../redux/admin/adminSlice.js'; // Import your action to reset the flag

export default function Home() {
  const [visible, setVisible] = useState(false); // To control visibility of the success message
  const { currentAdmin, showWelcomeMessage } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showWelcomeMessage) {
      setVisible(true);
      dispatch(resetWelcomeMessage()); // Reset the flag after showing the message

      // Set a timer to hide the message after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Keep it visible for 5 seconds

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [showWelcomeMessage, dispatch]);

  useEffect(() => {
    console.log(currentAdmin);
  }, [currentAdmin]);

  return (
    <Box sx={{ padding: "20px" }}>
      {visible && (
        <Box 
          className={`fixed top-0 right-0 bg-green-600 text-white p-4 flex w-[27%] z-50 rounded-bl-lg shadow-lg transition-transform transform ${visible ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <Typography className="flex-1">Welcome!!</Typography>
          <Button
            onClick={() => setVisible(false)}
            sx={{ color: 'white', marginLeft: '5px' }}
          >
            &times; {/* Close icon */}
          </Button>
        </Box>
      )}
      <Box marginBottom="20px">
        <Typography variant='h5' sx={{ fontWeight: '500' }}>
          Admin Dashboard
        </Typography>
        <Typography sx={{ color: '#A9A9A9', fontSize: '11px', lineHeight: 'normal', fontWeight: '400' }}>
          Here's an insight of your activity
        </Typography>
      </Box>
      <Box sx={{ display: "flex", width: "100%", gap: "5%" }}>
        <Box sx={{ flex: "0 0 70%", padding: "10px" }}>
          {/* Card Rendering */}
          <Box display="flex" gap="20px">
            {/* Card One  */}
            <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px" }}>
              <Typography sx={{ fontSize: "15px", color: "#A9A9A9", width: "90px" }}>
                Total Patient
              </Typography>
              <Box marginTop="15px" display="flex" justifyContent="space-between">
                <Typography sx={{ fontWeight: "bold" }}>0</Typography>
                <Diversity1OutlinedIcon sx={{ fill: "#00A272" }} />
              </Box>
            </Box>
            {/* Card Two  */}
            <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px" }}>
              <Typography sx={{ fontSize: "15px", color: "#A9A9A9", width: "90px" }}>
                Total Staff
              </Typography>
              <Box marginTop="15px" display="flex" justifyContent="space-between">
                <Typography sx={{ fontWeight: "bold" }}>0</Typography>
                <BadgeOutlinedIcon sx={{ fill: "#00A272" }} />
              </Box>
            </Box>
            {/* Card Three  */}
            <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px" }}>
              <Box>
                <Typography sx={{ fontSize: "15px", color: "#A9A9A9" }}>
                  Appointment
                </Typography>
              </Box>
              <Box marginTop="15px" display="flex" justifyContent="space-between">
                <Typography sx={{ fontWeight: "bold" }}>0</Typography>
                <CalendarMonthOutlinedIcon sx={{ fill: "#00A272" }} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ marginTop: "55px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <LineChart />
            <BarChart />
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "50px" }}>
          <GaugeCard />
          <SalesRecordGauge />
          <PerformanceGauge />
          <AppointmentSignals />
        </Box>
      </Box>
    </Box>
  );
}