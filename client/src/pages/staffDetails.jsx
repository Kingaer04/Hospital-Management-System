import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import PatientTable from '../components/tableComponet';
import AddStaffModal from '../components/addStaff';
import { useState } from 'react';

export default function StaffDetails() {
  const [isAddStaff, setIsAddStaff] = useState(false);
  const handleAddStaffClick = () => {
    setIsAddStaff(true);
  }
  return (
    <Box sx={{ padding: "20px" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant='h4' sx={{ fontWeight: '900' }}>
          Staff List
        </Typography>
        <Box sx={{ display: "flex", gap: "10px" }}>
            <Box display="flex" alignItems="center">
              <button className='text-[#00A272] rounded-[5px] bg-[#EEFFFC] flex items-center gap-3 p-3'>
                <img src='../../public/Icons/FilterIcon.png' className='w-4 h-4'/>
                Filter
              </button>
            </Box>
            <Box display="flex" alignItems="center" p="10px" bgcolor="#000A272" sx={{ borderRadius: "5px" }}>
              <button className='bg-[#00A272] rounded-[5px] text-white flex items-center gap-2 p-3 font-semibold text-[12px]' onClick={() => handleAddStaffClick()}>
                <img src='../../public/Icons/AddIcon.png' className='bg-white p-1 rounded-full outline-none'/>
                Add Staff
              </button>
            </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", width: "100%", gap: "5%" }}>
        <Box sx={{ flex: "0 0 100%", padding: "" }}>
          <Box>
            <PatientTable/>
          </Box>
        </Box>
      </Box>
      <AddStaffModal show={isAddStaff} handleClose={() => setIsAddStaff(false)} handleSubmit={() => setIsAddStaff(false)}/>
    </Box>
  )
}
