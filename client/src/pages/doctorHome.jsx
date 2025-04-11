
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const DoctorHome = () => {
  // State management
  const [recentPatients, setRecentPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 234,
    completedToday: 18
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeSlide, setActiveSlide] = useState(0);

  // Current user mock (would come from Redux in a real app)
  const currentUser = {
    name: "Sarah Johnson",
    _id: "doctor123",
    specialty: "Cardiologist"
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch doctor data - using mock data for demo
  useEffect(() => {
    // Simulate API fetch with mock data
    setTimeout(() => {
      setRecentPatients(mockRecentPatients);
    }, 500);
    
    // Toast notification for welcome
    setTimeout(() => {
      toast.success(`Welcome back, Dr. ${currentUser.name.split(' ')[1]}!`);
    }, 1000);
  }, []);

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
      title: `Welcome Back, Dr. ${currentUser.name.split(' ')[1] || currentUser.name}`,
      description: "Your patients are waiting for your expert care.",
      color: "from-blue-800 to-blue-600"
    },
    {
      title: "Patient Care Updates",
      description: `You've attended to ${stats.completedToday} patients today. Keep up the good work!`,
      color: "from-teal-700 to-teal-500"
    },
    {
      title: "Weekly Summary",
      description: "View your weekly performance metrics in your dashboard.",
      color: "from-indigo-700 to-indigo-500"
    }
  ];

  // Mock data for recent patients
  const mockRecentPatients = [
    {
      id: "P1001",
      name: "Michael Robinson",
      patientId: "PATIENT-1001",
      age: 45,
      gender: "Male",
      lastVisit: new Date(2023, 3, 15),
      diagnosis: "Hypertension",
      profileImage: null
    },
    {
      id: "P1002",
      name: "Amara Johnson",
      patientId: "PATIENT-1002",
      age: 32,
      gender: "Female",
      lastVisit: new Date(2023, 3, 16),
      diagnosis: "Diabetes Type 2",
      profileImage: null
    },
    {
      id: "P1003",
      name: "Terrell Washington",
      patientId: "PATIENT-1003",
      age: 58,
      gender: "Male",
      lastVisit: new Date(2023, 3, 14),
      diagnosis: "Arthritis",
      profileImage: null
    },
    {
      id: "P1004",
      name: "Zoe Williams",
      patientId: "PATIENT-1004",
      age: 27,
      gender: "Female",
      lastVisit: new Date(2023, 3, 17),
      diagnosis: null,
      profileImage: null
    },
    {
      id: "P1005",
      name: "David Thompson",
      patientId: "PATIENT-1005",
      age: 41,
      gender: "Male",
      lastVisit: new Date(2023, 3, 12),
      diagnosis: "Asthma",
      profileImage: null
    },
    {
      id: "P1006",
      name: "Imani Baker",
      patientId: "PATIENT-1006",
      age: 36,
      gender: "Female",
      lastVisit: new Date(2023, 3, 10),
      diagnosis: "Migraine",
      profileImage: null
    },
    {
      id: "P1007",
      name: "Marcus Lee",
      patientId: "PATIENT-1007",
      age: 52,
      gender: "Male",
      lastVisit: new Date(2023, 3, 11),
      diagnosis: "GERD",
      profileImage: null
    },
    {
      id: "P1008",
      name: "Aisha Jackson",
      patientId: "PATIENT-1008",
      age: 29,
      gender: "Female",
      lastVisit: new Date(2023, 3, 13),
      diagnosis: null,
      profileImage: null
    }
  ];

  // Custom patient modal component
  const PatientModal = ({ patient, onClose }) => {
    if (!patient) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Patient Details</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 text-xl font-semibold">
                {patient.profileImage ? (
                  <img src={patient.profileImage} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  patient.name?.substring(0, 2) || 'NA'
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-500">{patient.patientId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Age</p>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Last Visit</p>
                <p className="font-medium">
                  {new Date(patient.lastVisit).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                <p className="font-medium">{patient.diagnosis || 'Not diagnosed'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Appointment</p>
                    <p className="text-xs text-gray-500">Last appointment was on {new Date(patient.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Prescription</p>
                    <p className="text-xs text-gray-500">Last prescription issued 7 days ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                View Full Record
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 w-full min-h-screen flex flex-col bg-gray-50">
      {/* Hero Carousel Section */}
      <div className="mb-8 rounded-xl overflow-hidden shadow-lg relative">
        {heroItems.map((item, index) => (
          <div 
            key={index}
            className={`${
              activeSlide === index ? 'opacity-100' : 'opacity-0 absolute'
            } top-0 left-0 right-0 bottom-0 transition-opacity duration-500 ease-in-out`}
          >
            <div className={`relative w-full h-64 md:h-80 bg-gradient-to-r ${item.color} flex items-center`}>
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="ml-8 md:ml-16 z-10 text-white max-w-lg">
                <h1 className="font-bold text-2xl md:text-3xl mb-3">{item.title}</h1>
                <p className="text-sm md:text-base">{item.description}</p>
              </div>
              
              <div className="absolute right-0 h-full w-1/2 flex justify-end items-center overflow-hidden">
                {index === 0 && (
                  <img 
                    src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                    alt="Black doctor with stethoscope" 
                    className="h-full object-cover object-center"
                  />
                )}
                {index === 1 && (
                  <img 
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=734&q=80" 
                    alt="Doctor examining medical chart" 
                    className="h-full object-cover object-center"
                  />
                )}
                {index === 2 && (
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                    alt="Doctor team meeting" 
                    className="h-full object-cover object-center"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-2 h-2 rounded-full ${
                activeSlide === index ? 'bg-white' : 'bg-white/50'
              } transition-all duration-300`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 border-b-4 border-blue-600 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold mt-2">{stats.totalPatients}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3 h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            2.5% from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 border-b-4 border-teal-600 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold mt-2">{stats.completedToday}</p>
            </div>
            <div className="bg-teal-100 rounded-full p-3 h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            On track with your goals
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 border-b-4 border-indigo-600 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Upcoming Appointments</p>
              <p className="text-2xl font-bold mt-2">8</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3 h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Next in 45 minutes
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 border-b-4 border-purple-600 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Avg. Wait Time</p>
              <p className="text-2xl font-bold mt-2">12.5 min</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3 h-12 w-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            3.2 min improvement
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="w-full space-y-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Patients</h2>
                <p className="text-xs text-gray-500">Your most recent patient interactions</p>
              </div>
              <button className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentPatients.map((patient, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 cursor-pointer bg-white"
                  onClick={() => openPatientModal(patient)}
                >
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white mr-3 font-medium">
                      {patient.name?.substring(0, 2).toUpperCase() || 'NA'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.patientId}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age:</span>
                      <span className="font-medium">{patient.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium">{patient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Visit:</span>
                      <span className="font-medium">
                        {new Date(patient.lastVisit).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        patient.diagnosis                          
 ? 'bg-blue-100 text-blue-700'
 : 'bg-gray-100 text-gray-600'
  }`}
>
  {patient.diagnosis || 'Not diagnosed'}
</span>
  </div>
</div>
  ))}
</div>
  </div>
  
  {/* Today's Schedule */}
  <div className="bg-white rounded-lg shadow-md p-6">
<div className="flex justify-between items-center mb-5">
  <div>
<h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
<p className="text-xs text-gray-500">Your appointments for today</p>
  </div>
  <button className="text-sm text-blue-600 hover:text-blue-800">View full calendar</button>
</div>

<div className="space-y-3">
  <div className="flex p-3 rounded-lg border border-blue-100 bg-blue-50">
<div className="mr-4 text-center">
  <p className="text-xs text-gray-500">9:00 AM</p>
  <p className="text-sm font-medium">10:00 AM</p>
</div>
<div className="flex-grow">
  <h4 className="text-sm font-semibold">Michael Robinson</h4>
  <p className="text-xs text-gray-500">Follow-up Consultation</p>
</div>
<div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs self-center">
  Upcoming
</div>
  </div>
  
  <div className="flex p-3 rounded-lg border border-green-100 bg-green-50">
<div className="mr-4 text-center">
  <p className="text-xs text-gray-500">11:00 AM</p>
  <p className="text-sm font-medium">11:45 AM</p>
</div>
<div className="flex-grow">
  <h4 className="text-sm font-semibold">Amara Johnson</h4>
  <p className="text-xs text-gray-500">Diabetes Management</p>
</div>
<div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs self-center">
  Confirmed
</div>
  </div>
  
  <div className="flex p-3 rounded-lg border border-gray-100 bg-gray-50">
<div className="mr-4 text-center">
  <p className="text-xs text-gray-500">2:00 PM</p>
  <p className="text-sm font-medium">2:30 PM</p>
</div>
<div className="flex-grow">
  <h4 className="text-sm font-semibold">David Thompson</h4>
  <p className="text-xs text-gray-500">Asthma Check-up</p>
</div>
<div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs self-center">
  Pending
</div>
  </div>
</div>
  </div>
</div>
  </div>
  
  {/* Patient Details Modal */}
  {modalOpen && <PatientModal patient={selectedPatient} onClose={closeModal} />}
</div>
  );
};

export default DoctorHome;
