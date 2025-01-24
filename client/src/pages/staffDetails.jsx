import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import StaffTable from '../components/staffTable';
import AddStaffModal from '../components/addStaff';
import { useState } from 'react';

export default function StaffDetails() {
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success'); // Track notification type
  const [showModal, setShowModal] = useState(false);

  const handleAddStaffClick = () => {
    setShowModal(true);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <style>
        {`
          @keyframes slide-in {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .animate-slide-in {
            animation: slide-in 0.5s forwards;
          }
        `}
      </style>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant='h4' sx={{ fontWeight: '900' }}>
          Staff List
        </Typography>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Box display="flex" alignItems="center" p="10px" bgcolor="#000A272" sx={{ borderRadius: "5px" }}>
            <button
              className='bg-[#00A272] rounded-[5px] text-white flex items-center gap-2 p-3 font-semibold text-[12px]'
              onClick={handleAddStaffClick}
            >
              <img src='/Icons/AddIcon.png' className='bg-white p-1 rounded-full outline-none' alt="Add Icon" />
              Add Staff
            </button>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", width: "100%", gap: "5%" }}>
        <Box sx={{ flex: "0 0 100%", padding: "" }}>
          <Box>
            <StaffTable />
          </Box>
        </Box>
      </Box>
      <AddStaffModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        setNotification={setNotification}
        setNotificationType={setNotificationType} // Pass the function to set notification type
      />
      {notification && (
        <div 
          className={`fixed top-4 right-4 border border-green-400 text-green-800 p-4 rounded shadow-lg animate-slide-in z-50 ${
            notificationType === 'success' ? 'bg-green-200' : 'bg-red-200'
          }`}
        >
          <div className="flex justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="ml-2 text-green-800">✖</button>
          </div>
        </div>
      )}
    </Box>
  );
}