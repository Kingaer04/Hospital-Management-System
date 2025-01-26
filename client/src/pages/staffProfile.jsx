import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Avatar, Paper, Divider, FormControl, InputLabel, Select, MenuItem, LinearProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateStart, updateSuccess, updateFailure } from '../redux/admin/adminSlice'; // Import your update actions
import { useSnackbar } from 'notistack'; // For notifications

export default function StaffProfile() {
    const dispatch = useDispatch();
    const { currentAdmin } = useSelector((state) => state.admin);
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profileData, setProfileData] = useState({
        name: currentAdmin?.name || '',
        email: currentAdmin?.email || '',
        phone: currentAdmin?.phone || '',
        password: '',
        confirmPassword: '',
        role: currentAdmin?.role || 'User',
        nextOfKin: {
            name: '',
            phone: '',
            email: '',
            address: '',
            relationship: '',
            gender: '',
        },
    });
    const [profileImage, setProfileImage] = useState(currentAdmin?.profileImage || '/default-avatar.png');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('nextOfKin')) {
            const kinField = name.split('.')[1]; // Get the specific kin field
            setProfileData((prevData) => ({
                ...prevData,
                nextOfKin: {
                    ...prevData.nextOfKin,
                    [kinField]: value,
                },
            }));
        } else {
            setProfileData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (profileData.password !== profileData.confirmPassword) {
            enqueueSnackbar("Passwords do not match", { variant: 'error' });
            return;
        }

        dispatch(updateStart()); // Start the update process

        try {
            const updatedProfile = { ...profileData, profileImage }; // Include the new profileImage URL
            const response = await fetch('/api/profile/update', { // Replace with your update endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            dispatch(updateSuccess(updatedProfile)); // Dispatch the update action
            enqueueSnackbar("Profile updated successfully!", { variant: 'success' });

        } catch (error) {
            dispatch(updateFailure(error.message)); // Dispatch failure action
            enqueueSnackbar("Failed to update profile: " + error.message, { variant: 'error' });
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
                enqueueSnackbar("Image uploaded successfully!", { variant: 'success' });
            } else {
                enqueueSnackbar("Image upload failed: " + xhr.statusText, { variant: 'error' });
            }
            setLoading(false);
            setUploadProgress(0); // Reset progress after upload
        };

        xhr.onerror = () => {
            enqueueSnackbar("Image upload failed: Network error", { variant: 'error' });
            setLoading(false);
            setUploadProgress(0); // Reset progress after error
        };

        xhr.send(data); // Send the request
    };

    return (
        <Box sx={{ padding: '40px', backgroundColor: '#eaeff1' }}>
            <Paper elevation={6} sx={{ padding: '30px', borderRadius: '15px', backgroundColor: '#ffffff' }}>
                <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>Profile Settings</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Avatar
                                alt={profileData.name}
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
                                        label="Name"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Role"
                                        name="role"
                                        value={profileData.role}
                                        onChange={handleChange}
                                        variant="outlined"
                                        disabled={!currentAdmin?.isAdmin} // Disable if not admin
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
                                        value={profileData.nextOfKin.name}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Phone"
                                        name="nextOfKin.phone"
                                        value={profileData.nextOfKin.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Email"
                                        name="nextOfKin.email"
                                        value={profileData.nextOfKin.email}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Next of Kin Address"
                                        name="nextOfKin.address"
                                        value={profileData.nextOfKin.address}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="relationship-label">Relationship</InputLabel>
                                        <Select
                                            labelId="relationship-label"
                                            name="nextOfKin.relationship"
                                            value={profileData.nextOfKin.relationship}
                                            onChange={handleChange}
                                            label="Relationship"
                                            required
                                        >
                                            <MenuItem value="Parent">Parent</MenuItem>
                                            <MenuItem value="Sibling">Sibling</MenuItem>
                                            <MenuItem value="Spouse">Spouse</MenuItem>
                                            <MenuItem value="Child">Child</MenuItem>
                                            <MenuItem value="Friend">Friend</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="gender-label">Gender</InputLabel>
                                        <Select
                                            labelId="gender-label"
                                            name="nextOfKin.gender"
                                            value={profileData.nextOfKin.gender}
                                            onChange={handleChange}
                                            label="Gender"
                                            required
                                        >
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Password"
                                        name="password"
                                        value={profileData.password}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        value={profileData.confirmPassword}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
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
        </Box>
    );
}