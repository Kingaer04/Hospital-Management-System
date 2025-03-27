import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

export default function DateCalendarValue() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="w-full h-full">
        <DateCalendar
          sx={{
            width: '100%',
            '.MuiTypography-root': { color: '#A9A9A9' }, // Change text color for other text
            '.MuiPickersCalendarHeader-label': {
              color: '#00A272', // Change header text color
              fontWeight: 'bold'
            },
            '.MuiSvgIcon-root': {
              color: '#00A272', // Change icon color
            },
            '.MuiPickersDay-root': {
              '&.MuiPickersDay-today': {
                backgroundColor: '#00A272', // Highlight today
                borderRadius: '5px', // Make it a box shape
                outline: 'none', // Remove outline
                color: '#FFFFFF', // Change today's day number to white
                border: 'none',
                '&:hover, &.Mui-selected': {
                  backgroundColor: '#00A272', // Maintain highlight color on hover/selected
                  color: '#FFFFFF', // Change day number to white when highlighted
                }
              },
              '&:hover, &.Mui-selected': {
                backgroundColor: '#A9A9A9', // Maintain highlight color on hover/selected
                color: '#FFFFFF', // Change day number to white when highlighted
                borderRadius: "5px"
              }
            },
            // Custom styles for weekday headers
            '.MuiDayCalendar-weekDayLabel': {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              color: '#A9A9A9', // Change weekday label color
              textTransform: 'uppercase'
            }
          }}
          dayOfWeekFormatter={(day) => day.format('ddd').toUpperCase()}
        />
      </div>
    </LocalizationProvider>
  );
}
