import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PatientModal from '../components/patientModal';
import { Chip } from '@mui/material';

export default function DoctorHome() {
  const { currentUser } = useSelector((state) => state.user);
  const [recentPatients, setRecentPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    completedToday: 0
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch doctor data
  useEffect(() => {
    // Fetch recent patients
    const fetchRecentPatients = async () => {
      try {
        const response = await fetch(`/doctor/recent-patients/${currentUser._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setRecentPatients(data);
      } catch (error) {
        console.error('Error fetching recent patients:', error);
      }
    };

    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch(`/doctor/stats/${currentUser._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchRecentPatients();
    fetchStats();
  }, [currentUser._id]);

  const openPatientModal = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPatient(null);
  };

  // Hero carousel items
  const heroItems = [
    {
      title: "Welcome Back, Dr. " + (currentUser?.name?.split(' ')[1] || currentUser?.name || ""),
      description: "Your patients are waiting for your expert care.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Patient Care Updates",
      description: "You've attended to " + stats.completedToday + " patients today. Keep up the good work!",
      color: "from-green-500 to-emerald-400"
    },
    {
      title: "Weekly Summary",
      description: "View your weekly performance metrics in your dashboard.",
      color: "from-purple-500 to-indigo-400"
    }
  ];

  return (
    <div className="p-4 md:p-6 w-full min-h-screen flex flex-col bg-gray-50">
      {/* Hero Carousel Section */}
      <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="rounded-xl h-64 md:h-80 z-0"
        >
          {heroItems.map((item, index) => (
            <SwiperSlide key={index}>
              <div className={`relative w-full h-full bg-gradient-to-r ${item.color} flex items-center`}>
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="ml-8 md:ml-16 z-10 text-white w-1/2">
                  <h1 className="font-bold text-2xl md:text-3xl mb-3">{item.title}</h1>
                  <p className="text-sm md:text-base">{item.description}</p>
                </div>
                {/* We're directly embedding an image here instead of using background-image */}
                <div className="absolute right-0 h-full w-1/2 flex justify-end items-center">
                  <img 
                    src="/api/placeholder/400/320" 
                    alt="Doctor and nurse" 
                    className="h-full object-cover"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold mt-2">{stats.totalPatients}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 h-12 w-12 flex items-center justify-center">
              <AccountCircleOutlinedIcon sx={{ fill: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+2.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold mt-2">{stats.completedToday}</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-2 h-12 w-12 flex items-center justify-center">
              <QueryStatsOutlinedIcon sx={{ fill: "#4f46e5" }} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">On track with your goals</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="w-full space-y-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Recent Patients</h2>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentPatients.slice(0, 8).map((patient, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openPatientModal(patient)}
                >
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      {patient.profileImage ? (
                        <img src={patient.profileImage} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        patient.name?.substring(0, 2) || 'NA'
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.patientId}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span className="font-medium">{patient.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gender:</span>
                      <span className="font-medium">{patient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Visit:</span>
                      <span className="font-medium">
                        {new Date(patient.lastVisit).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <Chip
                      size="small"
                      label={patient.diagnosis || 'Not diagnosed'}
                      className="text-xs"
                      color={patient.diagnosis ? "primary" : "default"}
                      variant="outlined"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                <MedicalServicesOutlinedIcon sx={{ fontSize: 28, marginBottom: 1 }} />
                <span className="text-xs">New Patient</span>
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                <QueryStatsOutlinedIcon sx={{ fontSize: 28, marginBottom: 1 }} />
                <span className="text-xs">My Reports</span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                <AccountCircleOutlinedIcon sx={{ fontSize: 28, marginBottom: 1 }} />
                <span className="text-xs">My Profile</span>
              </button>
              <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                <MedicalServicesOutlinedIcon sx={{ fontSize: 28, marginBottom: 1 }} />
                <span className="text-xs">Treatment Plans</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      {modalOpen && selectedPatient && (
        <PatientModal patient={selectedPatient} onClose={closeModal} />
      )}
    </div>
  );
}
