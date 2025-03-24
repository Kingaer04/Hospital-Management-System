import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEllipsisV } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

const AppointmentTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { currentUser } = useSelector((state) => state.user);
  const { currentAdmin } = useSelector((state) => state.admin);
  const hospital_ID = currentUser.hospital_ID;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/recep-patient/appointmentData/${hospital_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
          throw new Error('Data format is incorrect');
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    }
    fetchData();
  }, [hospital_ID]);

  useEffect(() => {
    if (selectedAppointment) {
      console.log(selectedAppointment); // Log selectedAppointment whenever it changes
    }
  }, [selectedAppointment]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const response = await fetch(`/receptionist/patientData/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete appointment');
        }

        setData(data.filter(appointment => appointment._id !== id));
        enqueueSnackbar("Appointment deleted successfully!", { variant: 'success' });
        handleCloseModal(); // Close the modal after deletion
      } catch (error) {
        enqueueSnackbar("Error deleting appointment: " + error.message, { variant: 'error' });
      }
    }
  };

  const handleOpenModal = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };

  const filteredData = data.filter(appointment => {
    const fullName = `${appointment.patientId.first_name} ${appointment.patientId.last_name}`.toLowerCase();
    return (
      (fullName.includes(searchTerm.toLowerCase()) || 
      appointment.patientId.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      appointment.patientId.last_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter ? (statusFilter === 'Registered' ? appointment.status === "true" : appointment.status !== "true") : true)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/Logo_Images/nhmis_icon.png" alt="Loading..." className="animate-spin w-20 h-20" />
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <input
        type="text"
        placeholder="Search by name..."
        className="p-2 border border-gray-300 rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        className="p-2 border border-gray-300 rounded mb-4"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="Registered">Registered</option>
        <option value="Not Registered">Not Registered</option>
      </select>

      {filteredData.length === 0 ? (
        <div className="text-center text-gray-500">
          No appointment record found.
        </div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-[#00a272] text-white">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Phone Number</th>
              <th className="py-3 px-4 text-left">Reason</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Check In</th>
              <th className="py-3 px-4 text-left">Check Out</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((appointment, index) => (
              <tr key={appointment._id} className={`border-b transition duration-300 ease-in-out ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-green-100`}>
                <td className="py-3 px-4 flex items-center">
                  {appointment.patientId.avatar ? (
                    <img src={appointment.patientId.avatar} alt={`${appointment.patientId.first_name}'s avatar`} className="w-7 h-7 rounded-full mr-2 object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-300 text-white mr-2">
                      {appointment.patientId.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{appointment.patientId.first_name} {appointment.patientId.last_name}</span>
                </td>
                <td className="py-3 px-4">{appointment.patientId.phone}</td>
                <td className="py-3 px-4">{appointment.reason}</td>
                <td className="py-3 px-4">
                  <span style={{ color: appointment.status === "true" ? '#00A272' : 'red' }}>
                    {appointment.status === "true" ? 'Registered' : 'Not Registered'}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(appointment.checkIn).toLocaleString()}</td>
                <td className="py-3 px-4">
                  {appointment.checkOut ? new Date(appointment.checkOut).toLocaleString() : <span style={{ color: 'red' }}>Pending</span>}
                </td>
                <td className="py-3 px-4 flex space-x-2">
                  <button onClick={() => handleOpenModal(appointment)}>
                    <FaEllipsisV className="text-gray-600 hover:text-gray-800" />
                  </button>
                  {currentAdmin?.role === 'Admin' && (
                    <button 
                      onClick={() => handleDelete(appointment._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Appointment Details */}
      <Modal open={!!selectedAppointment} onClose={handleCloseModal}>
        <Box sx={{ padding: 2, width: 400, margin: 'auto', marginTop: '20%', bgcolor: 'white', borderRadius: 2 }}>
            {selectedAppointment && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-1/2 relative">
                        <button onClick={handleCloseModal} className="absolute top-2 right-2">
                            <CloseIcon sx={{ color: '#00A272' }} />
                        </button>
                        <img src={selectedAppointment.patientId.avatar} alt={`${selectedAppointment.patientId.first_name} ${selectedAppointment.patientId.last_name}`} className="w-24 h-24 rounded-full my-4 mx-auto border-2 border-[#00A272] object-cover" />
                        <p className='text-gray-700'>Name: <span className='font-semibold'>{selectedAppointment.patientId.first_name} {selectedAppointment.patientId.last_name}</span></p>
                        <p className='text-gray-700'>Email: <span className="font-semibold">{selectedAppointment.patientId.email}</span></p>
                        <p className='text-gray-700'>Phone: <span className="font-semibold">{selectedAppointment.patientId.phone}</span></p>
                        <p className='text-gray-700'>Reason: <span className="font-semibold">{selectedAppointment.reason}</span></p>
                        <p className='text-gray-700'>Status: <span className="font-semibold">{selectedAppointment.status === "true" ? 'Registered' : 'Not Registered'}</span></p>
                        <p className='text-gray-700'>Consultant Name: <span className="font-semibold">{selectedAppointment.doctorId.name}</span></p>
                        <p className='text-gray-700'>Consultant Email: <span className="font-semibold">{selectedAppointment.doctorId.email}</span></p>
                        
                        {currentAdmin?.role === 'Admin' && (
                            <div className="flex justify-end mt-4">
                                <button 
                                    onClick={() => handleDelete(selectedAppointment._id)} 
                                    className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                                >
                                    Delete Appointment
                                </button>
                            </div>
                        )}

                        {/* Conditional rendering of the Check Out button */}
                        {selectedAppointment.checkOut == null || isNaN(new Date(selectedAppointment.checkOut).getTime()) ? (
                            <Link to={`/payment-integration/${selectedAppointment.patientId._id}/${selectedAppointment._id}`} className="mt-2 inline-block bg-green-500 text-white py-1 px-3 rounded">
                                Check Out
                            </Link>
                        ) : null}
                    </div>
                </div>
            )}
        </Box>
      </Modal>
    </div>
  );
};

export default AppointmentTable;
