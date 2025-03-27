import React, { useState, useEffect } from 'react';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import DateCalendarValue from '../components/calendarComponent.jsx';
import { useSelector } from 'react-redux';
import PatientTable from '../components/patientTable.jsx';
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setRecentCheckouts(data);
    } catch (error) {
      console.error('Error fetching recent checkouts:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchRecentCheckouts();
  }, [currentUser.hospital_ID]);

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

  return (
    <div className="p-4 md:p-5 w-full">
      <div className="mb-6">
        <h5 className='font-bold text-lg md:text-xl'>
          Welcome, {currentUser.name.split(' ')[1]}!
        </h5>
        <p className="text-gray-500 text-xs md:text-sm">
          Here's an insight of your activity
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row w-full gap-5">
        <div className={`w-full ${windowWidth > 972 ? 'md:w-[70%]' : 'md:w-full'}`}>
          {/* Cards Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Total Patient</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">18</p>
                <Diversity1OutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Total Staff</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">18</p>
                <BadgeOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Appointments</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">18</p>
                <CalendarMonthOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            <div className='p-4 rounded-lg shadow-md bg-white'>
              <p className="text-sm text-gray-500">Pending Bills</p>
              <div className='mt-4 flex justify-between items-center'>
                <p className="font-bold">12</p>
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
          <div className='border border-gray-300 p-4 rounded-lg'>
            <p className='font-bold text-base mb-3'>Recent Patient Checkouts</p>
            <PatientTable patients={recentCheckouts} />
          </div>
        </div>

        {/* Sidebar with Calendar and Doctors */}
        {windowWidth > 972 && (
          <div className='w-full md:w-[30%] space-y-7'>
            <div className="border border-gray-300 rounded-lg p-4 flex justify-center items-center">
              <div className="w-full">
                <DateCalendarValue />
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <p className="font-bold text-base mb-4">Available Doctors</p>
              <div className="space-y-3">
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
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{doctor.name}</p>
                      <p className="text-xs text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
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
