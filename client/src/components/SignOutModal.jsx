import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const SignOutModal = ({ open, onClose }) => {
    const handleSignOut = () => {
        // Add sign out logic here
        onClose();
    };

    const handleCancel = () => {
        // Add any additional cancel logic here if needed
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