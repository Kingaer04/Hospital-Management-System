import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Paper, Tabs, Tab, 
  IconButton, CircularProgress, Avatar, Button
} from '@mui/material';
import { 
  CalendarToday, 
  People, 
  Badge, 
  TrendingUp,
  AttachMoney,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const Home = () => {
  const {currentAdmin} = useSelector(state => state.admin)
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [monthlyData, setMonthlyData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  
  const primaryColor = '#00A272';
  const secondaryColor = '#34C89A';

  const hospitalId = currentAdmin._id
  
  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]); // Re-fetch when date changes
  
  // Replace the fetchDashboardData function in your Home component with this:
const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch the statistics data from backend
      const staffResponse = await fetch(`/recep-patient/totalStaff/${hospitalId}`);
      const staffData = await staffResponse.json();
      
      const patientsResponse = await fetch(`/recep-patient/totalPatients/${hospitalId}`);
      const patientsData = await patientsResponse.json();
      
      const appointmentsResponse = await fetch(`/recep-patient/totalAppointments/${hospitalId}`);
      const appointmentsData = await appointmentsResponse.json();
      
      setTotalStaff(staffData.totalStaff);
      setTotalPatients(patientsData.totalPatients);
      setTotalAppointments(appointmentsData.totalAppointments);
      
      // Fetch monthly patient data
      const monthlyDataResponse = await fetch(`/recep-patient/monthly-patients/${hospitalId}`);
      const monthlyDataJson = await monthlyDataResponse.json();
      setMonthlyData(monthlyDataJson);
      
      // Fetch monthly revenue data
      const salesDataResponse = await fetch(`/recep-patient/monthly-revenue/${hospitalId}`);
      const salesDataJson = await salesDataResponse.json();
      setSalesData(salesDataJson);
      
      // Fetch doctors with most appointments
      const doctorsAppointmentsResponse = await fetch(`/recep-patient/doctors-appointments/${hospitalId}`);
      const doctorsAppointmentsJson = await doctorsAppointmentsResponse.json();
      setAppointmentTypes(doctorsAppointmentsJson);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If API fails, use mock data as fallback
      setMockData();
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(appointmentTypes)
    console.log(monthlyData)
  }, [])
  
  // Fallback to mock data if API fails
  const setMockData = () => {
    const mockMonthlyData = [
      { month: 'Jan', registeredPatients: 65, unregisteredPatients: 28 },
      { month: 'Feb', registeredPatients: 59, unregisteredPatients: 30 },
      { month: 'Mar', registeredPatients: 80, unregisteredPatients: 42 },
      { month: 'Apr', registeredPatients: 81, unregisteredPatients: 34 },
      { month: 'May', registeredPatients: 56, unregisteredPatients: 20 },
      { month: 'Jun', registeredPatients: 55, unregisteredPatients: 25 },
      { month: 'Jul', registeredPatients: 40, unregisteredPatients: 15 },
    ];
    
    const mockSalesData = [
      { month: 'Jan', amount: 4000 },
      { month: 'Feb', amount: 3000 },
      { month: 'Mar', amount: 5000 },
      { month: 'Apr', amount: 6000 },
      { month: 'May', amount: 4500 },
      { month: 'Jun', amount: 5500 },
      { month: 'Jul', amount: 7000 },
    ];
    
    const mockAppointmentTypes = [
      { name: 'General', value: 35, color: '#00A272' },
      { name: 'Dental', value: 25, color: '#34C89A' },
      { name: 'Pediatric', value: 20, color: '#7BE3C3' },
      { name: 'Cardiology', value: 15, color: '#B6F2E4' },
      { name: 'Orthopedics', value: 5, color: '#D8F9F1' },
    ];
    
    setTotalStaff(42);
    setTotalPatients(1253);
    setTotalAppointments(187);
    setMonthlyData(mockMonthlyData);
    setSalesData(mockSalesData);
    setAppointmentTypes(mockAppointmentTypes);
  };
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Custom chart components
  const BarChartComponent = ({ data }) => {
    const chartData = Array.isArray(data) ? data : [];
  
  const maxValue = chartData.length > 0 ? 
    Math.max(...chartData.map(item => Math.max(item.registeredPatients || 0, item.unregisteredPatients || 0))) : 
    0;
    
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, pt: 4 }}>
        {chartData.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  height: `${(item.unregisteredPatients / maxValue) * 200}px`, 
                  width: '40%', 
                  backgroundColor: secondaryColor,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease-in-out'
                }} 
              />
              <Box 
                sx={{ 
                  height: `${(item.registeredPatients / maxValue) * 200}px`, 
                  width: '40%', 
                  backgroundColor: primaryColor,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease-in-out'
                }} 
              />
            </Box>
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 500 }}>{item.month}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const LineChartComponent = ({ data }) => {
    const chartData = Array.isArray(data) ? data : [];
  
    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(item => item.amount)) : 0;
    const minValue = chartData.length > 0 ? Math.min(...chartData.map(item => item.amount)) : 0;
    const range = maxValue - minValue || 1; // Prevent division by zero
    
    // Create SVG path for the line
    let pathD = '';
    chartData.forEach((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.amount - minValue) / range) * 80;
      
      if (index === 0) {
        pathD += `M${x},${y} `;
      } else {
        pathD += `L${x},${y} `;
      }
    });
    
    return (
      <Box sx={{ position: 'relative', height: 300, width: '100%', mt: 2 }}>
        {/* Horizontal grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Box 
            key={i} 
            sx={{ 
              position: 'absolute', 
              width: '100%', 
              height: '1px', 
              backgroundColor: '#f0f0f0',
              top: `${i * 20}%`,
              zIndex: 1
            }} 
          />
        ))}
        
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area under the line */}
          <path 
            d={`${pathD} L100,100 L0,100 Z`}
            fill="url(#lineGradient)"
          />
          
          {/* The line itself */}
          <path
            d={pathD}
            fill="none"
            stroke={primaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.amount - minValue) / range) * 80;
            
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="6"
                  fill="white"
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                
                {/* Tooltip on hover */}
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="20"
                  fill="transparent"
                  stroke="transparent"
                >
                  <title>{`${item.month}: ${formatCurrency(item.amount)}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          position: 'absolute', 
          bottom: '-25px', 
          width: '100%' 
        }}>
          {chartData.map((item, index) => (
            <Typography key={index} variant="caption" sx={{ color: '#6b7280' }}>
              {item.month}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  };

  const PieChartComponent = ({ data }) => {
    const chartData = Array.isArray(data) ? data : []
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
        <Box sx={{ position: 'relative', width: 180, height: 180 }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {chartData.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              // Calculate coordinates for path
              const x1 = 50 + 30 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 30 * Math.sin((startAngle * Math.PI) / 180);
              
              const x2 = 50 + 30 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 30 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              
              const pathData = `M 50 50 L ${x1} ${y1} A 30 30 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              const section = (
                <path 
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth="1"
                >
                  <title>{`${item.name}: ${item.value} (${(percentage * 100).toFixed(0)}%)`}</title>
                </path>
              );
              
              startAngle += angle;
              return section;
            })}
            
            {/* Inner white circle to create donut effect */}
            <circle cx="50" cy="50" r="15" fill="white" />
          </svg>
          
          {/* Center text */}
          <Typography 
            variant="body2" 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontWeight: 600
            }}
          >
            {total} appts
          </Typography>
        </Box>
        
        {/* Legend */}
        <Box sx={{ ml: 4 }}>
          {chartData.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, mr: 1 }} />
              <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 500 }}>
                {item.name} ({(item.value / total * 100).toFixed(0)}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  const StatsCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      height: '100%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(0, 0, 0, 0.03)',
      overflow: 'visible',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      }
    }}>
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" mt={1} sx={{ color: '#1f2937' }}>
              {value}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              backgroundColor: `${color}15`,
              borderRadius: '12px',
              width: '52px',
              height: '52px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: `0 8px 20px ${color}25`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ padding: { xs: "16px", md: "24px" }, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box marginBottom="32px" display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Box>
          <Typography variant='h5' sx={{ fontWeight: '600', color: '#1f2937' }}>
            Admin Dashboard
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Here's an insight of your hospital's activity
          </Typography>
        </Box>
        <Box display="flex" gap={2} sx={{ mt: { xs: 2, sm: 0 } }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small"
                }
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard 
            title="Total Staff" 
            value={totalStaff} 
            icon={<Badge sx={{ color: primaryColor, fontSize: 28 }} />}
            color={primaryColor}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard 
            title="Total Patients" 
            value={totalPatients} 
            icon={<People sx={{ color: primaryColor, fontSize: 28 }} />}
            color={primaryColor}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard 
            title="Monthly Appointments" 
            value={totalAppointments} 
            icon={<CalendarToday sx={{ color: primaryColor, fontSize: 28 }} />}
            color={primaryColor}
          />
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Patient Registration Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            height: '100%',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.03)',
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box display="flex" alignItems="center">
                <BarChartIcon sx={{ color: primaryColor, mr: 1 }} />
                <Typography variant="h6" fontWeight="600">Patient Registration</Typography>
              </Box>
              <Box>
                <Button 
                  size="small"
                  variant={filterPeriod === 'week' ? 'contained' : 'outlined'}
                  onClick={() => handlePeriodChange('week')}
                  sx={{ 
                    mr: 1, 
                    borderRadius: '8px',
                    backgroundColor: filterPeriod === 'week' ? primaryColor : 'transparent',
                    borderColor: primaryColor,
                    color: filterPeriod === 'week' ? 'white' : primaryColor,
                    '&:hover': {
                      backgroundColor: filterPeriod === 'week' ? secondaryColor : `${primaryColor}10`,
                    }
                  }}
                >
                  Week
                </Button>
                <Button 
                  size="small"
                  variant={filterPeriod === 'month' ? 'contained' : 'outlined'}
                  onClick={() => handlePeriodChange('month')}
                  sx={{ 
                    borderRadius: '8px',
                    backgroundColor: filterPeriod === 'month' ? primaryColor : 'transparent',
                    borderColor: primaryColor,
                    color: filterPeriod === 'month' ? 'white' : primaryColor,
                    '&:hover': {
                      backgroundColor: filterPeriod === 'month' ? secondaryColor : `${primaryColor}10`,
                    }
                  }}
                >
                  Month
                </Button>
              </Box>
            </Box>
            
            {/* Custom Bar Chart */}
            <BarChartComponent data={monthlyData} />
            
            {/* Legend */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '2px', backgroundColor: primaryColor, mr: 1 }} />
                <Typography variant="caption" sx={{ color: '#4b5563' }}>Registered Patients</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '2px', backgroundColor: secondaryColor, mr: 1 }} />
                <Typography variant="caption" sx={{ color: '#4b5563' }}>Unregistered Patients</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Doctor's with most appointment */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(0, 0, 0, 0.03)',
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <PieChartIcon sx={{ color: primaryColor, mr: 1 }} />
                    <Typography variant="h6" fontWeight="600">Doctors with Most Appointments</Typography>
                </Box>
            </Box>
            
            {/* Custom Pie Chart */}
            <PieChartComponent data={appointmentTypes} />
          </Paper>
        </Grid>
      </Grid>
      
      {/* Sales/Revenue Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            height: '100%',
            border: '1px solid rgba(0, 0, 0, 0.03)',
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Box display="flex" alignItems="center">
                  <AttachMoney sx={{ color: primaryColor, mr: 1 }} />
                  <Typography variant="h6" fontWeight="600">Monthly Revenue</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Total for this year: {formatCurrency(Array.isArray(salesData) ? salesData.reduce((acc, curr) => acc + curr.amount, 0) : 0)}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  backgroundColor: `${primaryColor}15`,
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 6px 16px ${primaryColor}25`
                }}
              >
                <TrendingUp sx={{ color: primaryColor, fontSize: 24 }} />
              </Box>
            </Box>
            
            {/* Custom Line Chart */}
            <LineChartComponent data={salesData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
