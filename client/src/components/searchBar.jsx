import React, { useState } from 'react';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box } from '@mui/material';

export default function SearchBar() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleClearInput = () => {
    setInputValue('');
  };

  return (
    <Box
      sx={{
        border: "1px solid #A9A9A9",
        width: "100%",
        borderRadius: "10px",
        display: 'flex',
        alignItems: 'center',
        transition: 'border-color 0.3s',
        '&:focus-within': {
          borderColor: '#00A272',
          boxShadow: '0 0 0 2px rgba(47, 163, 128, 0.5)',
        }
      }}
    >
      <SearchOutlinedIcon sx={{ marginLeft: '8px' }} />
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className='w-full rounded-[10px] outline-none flex-grow p-2'
        placeholder="Search..."
      />
      {inputValue && (
        <ClearOutlinedIcon 
          sx={{ marginRight: '8px', cursor: 'pointer' }} 
          onClick={handleClearInput} 
        />
      )}
    </Box>
  );
}