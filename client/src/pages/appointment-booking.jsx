import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Grid, Avatar, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import SendingNotification from '../components/sendingNotification';

const AppointmentFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { currentUser } = useSelector((state) => state.user);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [reason, setReason] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [patientData, setPatientData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        avatar: '',
        reason: '',
    });
    const [notificationSent, setNotificationSent] = useState(false); // New state for notification

    useEffect(() => {
        // Fetch patient data using the patientId
        const fetchPatientData = async () => {
            try {
                const res = await fetch(`/recep-patient/patientData/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                if (data.error) {
                    console.log(data.error, 'error');
                } else {
                    setPatientData(data.patient);
                    if (data.patient.hospital_ID === currentUser.hospital_ID) {
                        setIsRegistered(true);
                    }
                }
            } catch (error) {
                console.log(error.message, 'error'); // Improved error logging
            }
        };

        // Fetch doctors for the dropdown
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`/recep-patient/doctorData/${currentUser.hospital_ID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setDoctors(data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };

        fetchDoctors();
        fetchPatientData();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const appointmentData = {
            patientId: patientData._id,
            hospital_ID: currentUser.hospital_ID,
            doctorId: selectedDoctor,
            status: isRegistered,
            reason,
            checkIn: new Date().toISOString(), // Capture the current time
        };
    
        try {
            const response = await fetch(`/recep-patient/book-appointment/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });
    
            if (response.ok) {
                console.log('Appointment created successfully');
                setNotificationSent(true); // Set notification flag
                // Wait for a moment to ensure notification is sent before navigating
                setTimeout(() => {
                    navigate('/appointment');
                }, 1000); // Adjust delay as needed
            } else {
                console.error('Failed to create appointment');
            }
        } catch (error) {
            console.error('Error while creating appointment:', error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPatientData({ ...patientData, [name]: value });
    };

    if (!patientData) return <div>Loading...</div>;

    return (
        <Box sx={{ padding: '30px', height: '100vh' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>Book Appointment</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar
                            alt={patientData.first_name}
                            src={patientData.avatar} // Use the state variable for the profile image
                            sx={{ width: 120, height: 120, marginBottom: '10px', border: '2px solid #00A272' }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="first_name"
                                    value={patientData.first_name}
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="last_name"
                                    value={patientData.last_name}
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={patientData.email}
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={patientData.phone}
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ margin: '20px 0' }} />
                                <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: 'bold' }}>Reason for Appointment</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Reason for appointment"
                                    name="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="select-doctor">Assign Doctor</InputLabel>
                                    <Select
                                        labelId="select-doctor"
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        label="Assign Doctor"
                                        required
                                    >
                                        {doctors.map((doctor) => (
                                            <MenuItem key={doctor._id} value={doctor._id}>
                                                {doctor.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" sx={{ backgroundColor: '#00A272' }}>
                                    Send & Assign
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    {notificationSent && selectedDoctor && patientData._id && ( // Only show after appointment creation
                        <SendingNotification 
                            doctorId={selectedDoctor}
                            patientId={patientData._id}
                            patientName={`${patientData.first_name} ${patientData.last_name}`}
                            patientImage={patientData.avatar}
                            receptionistId={currentUser._id} 
                            receptionistImage={currentUser.avatar ? currentUser.avatar : 'Icons/default-image.jpeg'} 
                            reason={reason}
                        />
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default AppointmentFormPage;