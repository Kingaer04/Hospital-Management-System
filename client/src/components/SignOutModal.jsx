import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOutAdminStart, signOutAdminSuccess, signOutAdminFailure } from '@/redux/admin/adminSlice';
import { signOutUserStart, signOutUserSuccess, signOutUserFailure } from '@/redux/user/userSlice';

const SignOutModal = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { currentAdmin } = useSelector(state => state.admin);
    const [error, setError] = useState(null);

    async function handleSignOut() {
        let role;

        // Determine the role based on currentUser or currentAdmin
        if (currentAdmin) {
            role = 'Admin';
            dispatch(signOutAdminStart());
        } else if (currentUser) {
            role = currentUser.role; // Assuming currentUser has a property 'role'
            dispatch(signOutUserStart());
        } else {
            setError("No user is currently logged in.");
            return;
        }

        try {
            const res = await fetch(role === 'Admin' ? '/admin/SignOut' : '/staff/SignOut', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (data.error) {
                if (role === 'Admin') {
                    dispatch(signOutAdminFailure(data.error));
                } else {
                    dispatch(signOutUserFailure(data.error));
                }
                setError(data.error);
                return;
            }

            // Clear user state on successful sign-out
            if (role === 'Admin') {
                dispatch(signOutAdminSuccess(data));
                navigate('/Sign-In'); // Redirect to Admin Sign-In
            } else {
                dispatch(signOutUserSuccess(data));
            }
        } catch (error) {
            if (role === 'Admin') {
                dispatch(signOutAdminFailure(error.message));
            } else {
                dispatch(signOutUserFailure(error.message));
            }
            setError(error.message);
        }
    }

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" component="h2">
                    Confirm Sign Out
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Are you sure you want to sign out?
                </Typography>
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#00A272', '&:hover': { backgroundColor: '#007B5E' } }}
                        onClick={handleSignOut}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ color: '#00A272', borderColor: '#00A272', '&:hover': { borderColor: '#007B5E' } }}
                        onClick={handleCancel}
                    >
                        No
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default SignOutModal;