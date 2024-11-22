import { Box, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/tableComponet';
import DateCalendarValue from '../components/calendarComponent';


export default function ReceptionistHome() {
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
                    <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px"
                        }}>
                        <Typography sx={{ fontSize: "15px", color: "#A9A9A9", width: "90px" }}>
                            Total Patient
                        </Typography>
                        <Box marginTop="15px" display="flex" justifyContent="space-between">
                            <Typography sx={{ fontWeight: "bold" }}>18</Typography>
                            <Diversity1OutlinedIcon sx={{ fill:"#00A272" }}/>
                        </Box>
                    </Box>
                    {/* Card Two  */}
                    <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px"
                        }}>
                        <Typography sx={{ fontSize: "15px", color: "#A9A9A9", width: "90px" }}>
                            Total Staff
                        </Typography>
                        <Box marginTop="15px" display="flex" justifyContent="space-between">
                            <Typography sx={{ fontWeight: "bold" }}>18</Typography>
                            <BadgeOutlinedIcon sx={{ fill:"#00A272" }}/>
                        </Box>
                    </Box>
                    {/* Card Three  */}
                    <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px"
                        }}>
                            <Box>
                                    <Typography sx={{ fontSize: "15px", color: "#A9A9A9" }}>
                                            Appointment
                                    </Typography>
                            </Box> 
                            <Box marginTop="15px" display="flex" justifyContent="space-between">
                                    <Typography sx={{ fontWeight: "bold" }}>18</Typography>
                                    <CalendarMonthOutlinedIcon sx={{ fill:"#00A272" }}/>
                            </Box>
                    </Box>
                    {/* Card Four  */}
                    <Box sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", padding: "10px", width: "100%", borderRadius: "10px"
                        }}>
                        <Typography sx={{ fontSize: "15px", color: "#A9A9A9", width: "90px" }}>
                            Lab Report
                        </Typography>
                        <Box marginTop="15px" display="flex" justifyContent="space-between">
                            <Typography sx={{ fontWeight: "bold" }}>18</Typography>
                            <CalendarMonthOutlinedIcon sx={{ fill:"#00A272" }}/>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
)
}
