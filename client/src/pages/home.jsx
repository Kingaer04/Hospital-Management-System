import { Box, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/tableComponet';
import DateCalendarValue from '../components/calendarComponent';


export default function Home() {
  return (
    <Box sx={{ padding: "20px" }}>
      <Box marginBottom="20px">
        <Typography variant='h5' sx={{ fontWeight: '500' }}>
          Welcome, Anny
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
            <Box sx={{ border: "1px solid #A9A9A9", padding: "10px", width: "100%", borderRadius: "10px"
              }}>
              <Typography sx={{ fontSize: "15px" }}>
                Total Patient
              </Typography>
              <Box marginTop="15px" display="flex" justifyContent="space-between">
                <Typography>18</Typography>
                <Diversity1OutlinedIcon sx={{ fill:"#00A272" }}/>
              </Box>
            </Box>
            {/* Card Two  */}
            <Box sx={{ border: "1px solid #A9A9A9", padding: "10px", width: "100%", borderRadius: "10px"
              }}>
              <Typography sx={{ fontSize: "15px" }}>
                Total Staff
              </Typography>
              <Box marginTop="15px" display="flex" justifyContent="space-between">
                <Typography>18</Typography>
                <BadgeOutlinedIcon sx={{ fill:"#00A272" }}/>
              </Box>
            </Box>
            {/* Card Three  */}
            <Box sx={{ border: "1px solid #A9A9A9", padding: "10px", width: "100%", borderRadius: "10px"
              }}>
              <Typography sx={{ fontSize: "15px" }}>
                Appointment
              </Typography>
              <Box marginTop="15px" display="flex" justifyContent="space-between">
                <Typography>18</Typography>
                <CalendarMonthOutlinedIcon sx={{ fill:"#00A272" }}/>
              </Box>
            </Box>
          </Box>
          <Box marginTop="40px" sx={{ border: "1px solid #A9A9A9", padding: "4%", borderRadius: "10px" }}>
            <p className='font-bold text-[100%]'>
              Search For Patient By Name or ID
            </p>
            <SearchBar/>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: "5px", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "65%" }}>
                Status: Available
              </Typography>
              <Typography sx={{ fontSize: "65%" }}>
                Patient's Name: Samuel Sophia
              </Typography>
              <Typography sx={{ fontSize: "65%" }}>
                Patient's ID: 001
              </Typography>
              <Button sx={{ bgcolor: "#00A272", color: "#fff", fontSize: "65%" }}>
                Book new Appointment
              </Button>
            </Box>
          </Box>
          <Box>
            <Typography marginTop="15px" fontWeight="bold">Patient's Data</Typography>
            <PatientTable/>
          </Box>
        </Box>
        <Box sx={{ flex: "0 0 25%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ border: "1px solid #A9A9A9", borderRadius: "10px" }}>
            <DateCalendarValue/>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
