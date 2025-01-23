import React, {useState} from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { signOutAdminStart, signOutAdminSuccess, signOutAdminFailure } from '@/redux/admin/adminSlice';
import { useDispatch } from 'react-redux';

const SignOutModal = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const [error, setError] = React.useState(null);

    async function handleSignOut() {
        dispatch(signOutAdminStart())
        try {
          const res = await fetch('/admin/SignOut')
          const data = await res.json()
          if (data.error) {
            dispatch(signOutAdminFailure(data.error))
            setError(data.error)
            return
          }
          dispatch(signOutAdminSuccess(data))
        //   navigate('/SignIn')
        } catch (error) {
          dispatch(signOutAdminFailure(error))
            setError(error)
        }
      };

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