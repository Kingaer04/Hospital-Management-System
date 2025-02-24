import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Avatar, Paper, Divider, FormControl, InputLabel, Select, MenuItem, LinearProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon
import { useDispatch, useSelector } from 'react-redux';
import { updateStart, updateSuccess, updateFailure } from '../redux/user/userSlice'; // Import your update actions
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function PatientProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate
    const { currentUser } = useSelector((state) => state.user);
    const { currentAdmin } = useSelector((state) => state.admin); 
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profileImage, setProfileImage] = useState(currentUser?.avatar || '/default-avatar.png');
    const [patientData, setPatientData] = useState({
        hospital_ID: currentUser.hospital_ID,
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        patientDoB: '',
        phone: '',
        address: '',
        relationshipStatus: '',
        avatar: '',
        fingerprint_Data: null,
        nextOfKin: {
            name: '',
            phone: '',
            email: '',
            address: '',
            relationshipStatus: '',
            gender: '',
        },
    });

    // State for messages
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [showMessage, setShowMessage] = useState(false);

    // useEffect(() => {
    //     // Redirect logic based on role
    //     if (!currentUser && !currentAdmin) {
    //         navigate('/Staff-SignIn'); // Redirect to Staff Sign-In if no user is logged in
    //     } else if (currentAdmin && currentAdmin.role === 'Admin') {
    //         navigate('/settings'); // Redirect if currentAdmin is Admin
    //     } else if (currentUser) {
    //         if (currentUser.role === 'Receptionist' || currentUser.role === 'Doctor') {
    //             navigate('/profile'); // Redirect for Receptionist and Doctor
    //         }
    //     }
    // }, [currentUser, currentAdmin, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('nextOfKin')) {
            const kinField = name.split('.')[1];
            setPatientData((prevData) => ({
                ...prevData,
                nextOfKin: {
                    ...prevData.nextOfKin,
                    [kinField]: value,
                },
            }));
        } else {
            setPatientData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (patientData.newPassword !== patientData.confirmPassword) {
            showMessageWithTimeout('Passwords do not match', 'error');
            return;
        }

        dispatch(updateStart()); // Start the update process
        setMessage(''); // Clear previous messages

        try {
            const updatedProfile = { ...patientData, avatar: profileImage };
            const response = await fetch(`/staff/Update/${currentUser._id}`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });
            const data = await response.json();
            if (data.error) {
                dispatch(updateFailure(data.error)); // Dispatch failure action
                showMessageWithTimeout(data.error, 'error');
            } else {
                dispatch(updateSuccess(data)); // Dispatch the update action
                showMessageWithTimeout("Profile updated successfully!", 'success');
            }
        } catch (error) {
            dispatch(updateFailure(error.message)); // Dispatch failure action
            showMessageWithTimeout("Failed to update profile: " + error.message, 'error');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setLoading(true);
        setUploadProgress(0);

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'Hospital_management_profile');
        data.append('cloud_name', 'dyc0ssabt');

        const xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dyc0ssabt/image/upload', true);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentComplete); // Update upload progress
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText);
                setProfileImage(uploadedImageUrl.url); // Update the profileImage state with the new URL
                showMessageWithTimeout("Image uploaded successfully!", 'success');
            } else {
                showMessageWithTimeout("Image upload failed: " + xhr.statusText, 'error');
            }
            setLoading(false);
            setUploadProgress(0);
        };

        xhr.onerror = () => {
            showMessageWithTimeout("Image upload failed: Network error", 'error');
            setLoading(false);
            setUploadProgress(0);
        };

        xhr.send(data); // Send the request
    };

    const showMessageWithTimeout = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setShowMessage(true);
        
        setTimeout(() => {
            setShowMessage(false);
            setMessage('');
        }, 5000); // Message will disappear after 5 seconds
    };

    const handleCloseMessage = () => {
        setShowMessage(false);
        setMessage('');
    };

    return (
        <Box sx={{ padding: '40px', backgroundColor: '#eaeff1', position: 'relative', minHeight: '100vh' }}>
            {showMessage && (
                <Box 
                    sx={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        backgroundColor: messageType === 'success' ? '#00A272' : 'red',
                        color: 'white',
                        padding: '15px 25px', // Increased padding for a larger box
                        borderRadius: '8px',
                        border: '2px solid white', // Added border
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Added shadow for depth
                        transition: 'all 0.5s ease-in-out',
                        zIndex: 1000,
                        animation: `${showMessage ? 'slideIn 0.5s forwards' : 'slideOut 0.5s forwards'}`,
                    }}
                >
                    <Typography variant="body1" sx={{ display: 'inline' }}>{message}</Typography>
                    <IconButton onClick={handleCloseMessage} sx={{ color: 'white', marginLeft: '10px' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            )}
            <Paper elevation={6} sx={{ padding: '30px', borderRadius: '15px', backgroundColor: '#ffffff' }}>
                <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>Patient Profile Settings</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Avatar
                                alt={patientData.first_name}
                                src={profileImage} // Use the state variable for the profile image
                                sx={{ width: 120, height: 120, marginBottom: '10px', border: '2px solid #00A272' }}
                            />
                            <Button variant="contained" component="label" sx={{ backgroundColor: '#00A272', color: '#fff' }}>
                                Change Profile Picture
                                <input type="file" hidden accept='image/*' onChange={handleFileUpload} />
                            </Button>
                            {loading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ width: '100%', marginTop: '10px' }} />}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <form onSubmit={handleProfileUpdate}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="first_name"
                                        value={patientData.first_name}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="last_name"
                                        value={patientData.last_name}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={patientData.email}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        value={patientData.address}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="relationshipStatus-label">Relationship</InputLabel>
                                        <Select
                                            labelId="relationshipStatus-label"
                                            name="relationshipStatus"
                                            value={patientData.relationshipStatus}
                                            onChange={handleChange}
                                            label="Relationship Status"
                                        >
                                            <MenuItem value="Married">Married</MenuItem>
                                            <MenuItem value="Single">Single</MenuItem>
                                            <MenuItem value="Widow">Widow</MenuItem>
                                            <MenuItem value="Widower">Widower</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={patientData.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ margin: '20px 0' }} />
                                    <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: 'bold' }}>Next of Kin Details</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Name"
                                        name="nextOfKin.name"
                                        value={patientData.nextOfKin.name}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Phone"
                                        name="nextOfKin.phone"
                                        value={patientData.nextOfKin.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Email"
                                        name="nextOfKin.email"
                                        value={patientData.nextOfKin.email}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Address"
                                        name="nextOfKin.address"
                                        value={patientData.nextOfKin.address}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="relationship-label">Relationship</InputLabel>
                                        <Select
                                            labelId="relationship-label"
                                            name="nextOfKin.relationshipStatus"
                                            value={patientData.nextOfKin.relationshipStatus}
                                            onChange={handleChange}
                                            label="Relationship"
                                        >
                                            <MenuItem value="Father">Father</MenuItem>
                                            <MenuItem value="Mother">Mother</MenuItem>
                                            <MenuItem value="Sibling">Sibling</MenuItem>
                                            <MenuItem value="Friend">Friend</MenuItem>
                                            <MenuItem value="Other Relatives">Other Relatives</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="gender-label">Gender</InputLabel>
                                        <Select
                                            labelId="gender-label"
                                            name="nextOfKin.gender"
                                            value={patientData.nextOfKin.gender}
                                            onChange={handleChange}
                                            label="Gender"
                                        >
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ margin: '20px 0' }} />
                                    <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: 'bold' }}>Password</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Old Password"
                                        name="oldPassword"
                                        value={patientData.oldPassword} // Correct value here
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="New Password"
                                        name="newPassword"
                                        value={patientData.newPassword} // Correct value here
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        value={patientData.confirmPassword}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button type="submit" variant="contained" color="primary" sx={{ backgroundColor: '#00A272' }}>
                                        Update Profile
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Paper>

            {/* Inline CSS for Animations */}
            <style>
                {`
                    @keyframes slideIn {
                        0% {
                            transform: translateY(-20px);
                            opacity: 0;
                        }
                        100% {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    @keyframes slideOut {
                        0% {
                            transform: translateY(0);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(-20px);
                            opacity: 0;
                        }
                `}
            </style>
        </Box>
    );
}