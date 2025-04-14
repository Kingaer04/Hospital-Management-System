import React, { useState, useEffect } from 'react';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import DateCalendarValue from '../components/calendarComponent.jsx';
import { useSelector } from 'react-redux';
import PatientModal from '../components/patientModal';

export default function ReceptionistHome() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchItem, setSearchItem] = useState('');
  const [patientData, setPatientData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [recentCheckouts, setRecentCheckouts] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [totalPatient, setTotalPatient] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPendingAppointments, setTotalPendingAppointments] = useState(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('currentUser', currentUser);
    // Fetch available doctors
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`/recep-patient/doctorData/${currentUser.hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('availableDoctors', data);
        setAvailableDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    // Fetch recent checkouts
    const fetchRecentCheckouts = async () => {
      try {
        const response = await fetch(`/recep-patient/recentCheckouts/${currentUser.hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('recentCheckouts', data);
        
        // Process the data to ensure we're working with simple strings, not objects
        const processedData = data.map(checkout => {
          // Ensure patient data is processed correctly
          let patientName = 'Unknown';
          let patientId = 'ID not available';
          
          // Handle patient data which could be an object or string
          if (checkout.patientId) {
            if (typeof checkout.patientId === 'object') {
              // If patient is an object, extract name from first_name and last_name
              patientName = `${checkout.patientId.first_name || ''} ${checkout.patientId.last_name || ''}`.trim() || 'Unknown';
              patientId = checkout.patientId._id || 'ID not available';
            } else {
              // If patient is a string, use it as is
              patientName = checkout.patient;
            }
          } else if (checkout.patientName) {
            // If patientName already exists, use it
            patientName = checkout.patientName;
            patientId = checkout.patientId || 'ID not available';
          }
          
          // Handle doctor data which could be an object or string
          let doctorName = 'Not assigned';
          if (checkout.doctorId) {
            if (typeof checkout.doctorId === 'object') {
              doctorName = checkout.doctorId.name || 'Not assigned';
            } else {
              doctorName = checkout.doctor;
            }
          } else if (checkout.doctorName) {
            doctorName = checkout.doctorName;
          }
          
          return {
            ...checkout,
            _id: checkout._id || `temp-id-${Math.random()}`,
            patientName,
            patientId,
            doctorName,
            checkoutDate: checkout.checkOut
          };
        });
        
        setRecentCheckouts(processedData);
      } catch (error) {
        console.error('Error fetching recent checkouts:', error);
      }
    };
    
    if (currentUser && currentUser.hospital_ID) {
      fetchDoctors();
      fetchRecentCheckouts();
    }
  }, [currentUser]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const response = await fetch('/recep-patient/searchPatient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchItem }),
    });

    const data = await response.json();
    setPatientData(data);

    if (data.length > 0) {
      setSelectedPatient(data[0]);
      setModalOpen(true);
      setSearchMessage('');
    } else {
      setSearchMessage('No patient found with the provided credentials.');
      setSelectedPatient(null);

      setTimeout(() => {
        setSearchMessage('');
      }, 5000);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPatientData([]);
    setSearchItem('');
  };

  useEffect(() => {
    const fetchTotalPatients = async () => {
      try {
        const response = await fetch(`/recep-patient/totalPatients/${currentUser.hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        // Make sure we're setting a number, not an object
        setTotalPatient(data.totalPatients || 0);
      } catch (error) {
        console.error('Error fetching total patients:', error);
        setTotalPatient(0);
      }
    }

    const fetchTotalStaff = async () => {
      try {
        const response = await fetch(`/recep-patient/totalStaff/${currentUser.hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        // Make sure we're setting a number, not an object
        setTotalStaff(data.totalStaff || 0);
      } catch (error) {
        console.error('Error fetching total staff:', error);
        setTotalStaff(0);
      }
    }

    const fetchTotalAppointments = async () => {
      try {
        const response = await fetch(`/recep-patient/totalAppointments/${currentUser.hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        // Make sure we're setting a number, not an object
        setTotalAppointments(data.totalAppointments || 0);
      } catch (error) {
        console.error('Error fetching total appointments:', error);
        setTotalAppointments(0);
      }
    }

    const fetchTotalPendingAppointments = async () => {
      try {
        const response = await fetch(`/recep-patient/totalPendingAppointments/${currentUser.hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        // Make sure we're setting a number, not an object
        setTotalPendingAppointments(data.totalPendingAppointments || 0);
      } catch (error) {
        console.error('Error fetching total pending appointments:', error);
        setTotalPendingAppointments(0);
      }
    }

    if (currentUser && currentUser.hospital_ID) {
      fetchTotalPatients();
      fetchTotalStaff();
      fetchTotalAppointments();
      fetchTotalPendingAppointments();
    }
  }, [currentUser])

  return (
    <div className="p-4 md:p-5 w-full min-h-screen flex flex-col">
      <div className="mb-6">
        <h5 className='font-bold text-lg md:text-xl'>
          Welcome, {currentUser?.name?.split(' ')?.[1] || 'User'}!
        </h5>
        <p className="text-gray-500 text-xs md:text-sm">
          Here's an insight of your activity
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row w-full gap-5 flex-grow">
        <div className={`w-full ${windowWidth > 972 ? 'md:w-[70%]' : 'md:w-full'} flex flex-col`}>
          {/* Cards Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Total Patient</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">{typeof totalPatient === 'number' ? totalPatient : 0}</p>
                <Diversity1OutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Total Staff</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">{typeof totalStaff === 'number' ? totalStaff : 0}</p>
                <BadgeOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Appointments</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">{typeof totalAppointments === 'number' ? totalAppointments : 0}</p>
                <CalendarMonthOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Pending Bills</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">{typeof totalPendingAppointments === 'number' ? totalPendingAppointments : 0}</p>
                <LocalHospitalOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className='border border-gray-300 p-4 rounded-lg mb-6'>
            <p className='font-bold text-base mb-3'>
              Search For Patient By PatientID, Phone or Email
            </p>
            <form onSubmit={handleSearch} className='flex gap-3'>
              <input
                type="text"
                placeholder="Enter phone or email"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="border rounded p-2 w-full focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]"
              />
              {searchItem && (
                <button 
                  type="submit" 
                  className='bg-[#00A272] text-white text-sm rounded-md p-2'
                >
                  Search
                </button>
              )}
            </form>
            {searchMessage && (
              <p className="text-red-500 mt-2">{searchMessage}</p>
            )}
          </div>

          {/* Recent Checkouts Section */}
          <div className='border border-gray-300 p-4 rounded-lg flex-grow mb-6 h-96'>
            <p className='font-bold text-base mb-3'>Recent Patient Checkouts</p>
            {recentCheckouts.length > 0 ? (
              <div className="overflow-y-auto h-[calc(100%-2rem)] pr-1">
                <table className="min-w-full bg-white rounded-lg">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Patient</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Doctor</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentCheckouts.map((checkout, index) => (
                      <tr key={checkout._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 mr-3">
                              {/* Safely access the first 2 characters of patient name */}
                              {(checkout.patientName || '').substring(0, 2) || 'N/A'}
                            </div>
                            <div>
                              <p className="font-medium">{checkout.patientName || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{checkout.patientId || 'ID not available'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {checkout.checkoutDate ? 
                            new Date(checkout.checkoutDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'
                          }
                        </td>
                        <td className="py-3 px-4 text-sm">{checkout.doctorName || 'Not assigned'}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100%-2rem)] bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 font-medium">No recent checkouts found</p>
                  <p className="text-gray-400 text-sm mt-1">When patients check out, they'll appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with Calendar and Doctors */}
        {windowWidth > 972 && (
          <div className='w-full md:w-[30%] space-y-6 flex flex-col'>
            <div className="border border-gray-300 rounded-lg p-4 flex justify-center items-center">
              <div className="w-full">
                <DateCalendarValue />
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 mb-6 h-60">
              <p className="font-bold text-base mb-4">Available Doctors</p>
              {availableDoctors.length > 0 ? (
                <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)] pr-1">
                  {availableDoctors.map((doctor) => (
                    <div 
                      key={doctor._id} 
                      className="flex items-center space-x-3 bg-gray-100 p-2 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {doctor.image ? (
                          <img 
                            src={doctor.image} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-500 flex items-center justify-center text-white">
                            {(doctor.name || '').split(' ').map(n => n[0] || '').join('') || 'DR'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{doctor.name || ''}</p>
                        <p className="text-xs text-gray-500">{doctor.specialization || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[calc(100%-2rem)] bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 font-medium">No doctors available</p>
                    <p className="text-gray-400 text-sm mt-1">Currently, there are no doctors available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Patient Details */}
      {modalOpen && selectedPatient && (
        <PatientModal patient={selectedPatient} onClose={closeModal} />
      )}
    </div>
  );
}
