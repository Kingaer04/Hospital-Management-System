import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const AppointmentTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
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
        // console.log(result)
        if (Array.isArray(result)) {
          setData(result);
          console.log(result)
        } else {
          throw new Error('Data format is incorrect');
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    }
    console.log(data)
    fetchData();
  }, [hospital_ID]);

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

  const filteredData = data.filter(appointment =>
    appointment.patientId.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <img src={appointment.patientId.avatar} alt={`${appointment.patientId.first_name}'s avatar`} className="w-7 h-7 rounded-full mr-2" />
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
                  <Link to={`/patient/edit/${appointment.patientId._id}`} className="flex items-center">
                    <FaEdit className="text-blue-600 hover:text-blue-800" />
                  </Link>
                  {currentAdmin?.role === 'Admin' && (
                    <button onClick={() => handleDelete(appointment._id)}>
                      <FaTrash className="text-red-600 hover:text-red-800" />
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(appointment)}>
                    <FaEllipsisV className="text-gray-600 hover:text-gray-800" />
                  </button>
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
            <>
              <h2 className="text-lg font-bold">{selectedAppointment.patientId.first_name} {selectedAppointment.patientId.last_name}</h2>
              <img src={selectedAppointment.patientId.avatar} alt="Patient Avatar" className="w-16 h-16 rounded-full mb-2" />
              <p>Email: {selectedAppointment.patientId.email}</p>
              <p>Phone: {selectedAppointment.patientId.phone}</p>
              <p>Reason: {selectedAppointment.reason}</p>
              <p>Status: {selectedAppointment.status === "true" ? 'Registered' : 'Not Registered'}</p>
              <Link to={`/checkout/${selectedAppointment._id}`} className="mt-2 inline-block bg-green-500 text-white py-1 px-3 rounded">
                Check Out
              </Link>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AppointmentTable;