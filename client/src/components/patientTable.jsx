import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';

const PatientTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { currentUser } = useSelector((state) => state.user);
  const { currentAdmin } = useSelector((state) => state.admin);
  const hospital_ID = currentUser.hospital_ID;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/recep-patient/patientDetails/${hospital_ID}`, {
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
        if (Array.isArray(result.patient)) {
          setData(result.patient);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(`/receptionist/patientData/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            hospital_ID: currentAdmin._id,
            role: currentAdmin.role,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }

        setData(data.filter(user => user._id !== id));
        enqueueSnackbar("Patient deleted successfully!", { variant: 'success' });
      } catch (error) {
        enqueueSnackbar("Error deleting patient: " + error.message, { variant: 'error' });
      }
    }
  };

  const filteredData = data.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter ? user.relationshipStatus === roleFilter : true)
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
      <div className='flex gap-3 mb-4'>
        <input
          type="text"
          placeholder="Search by name..."
          className="p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className='flex border h-[42px] rounded-lg items-center p-2 bg-[#EEFFFC]'>
          <img src='/Icons/FilterIcon.png' className='w-4 h-4 mb-3 mt-4' />
          <select
            className="p-2 rounded bg-transparent text-[#00A272] font-semibold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Filter</option>
            <option value="Single">Single</option>
            <option value="Receptionist">Receptionist</option>
          </select>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center text-gray-500">
          No patient record found. Click the add button to add patients.
        </div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-[#00a272] text-white">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Phone Number</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user, index) => (
              <tr key={user._id} className={`border-b transition duration-300 ease-in-out ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-green-100`}>
                <td className="py-3 px-4 flex items-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.first_name}'s avatar`} className="w-7 h-7 rounded-full mr-2" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-300 text-white mr-2">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.first_name} {user.last_name}</span>
                </td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.relationshipStatus}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <Link to={`/patient/edit/${user._id}`} className="flex items-center">
                    <FaEdit className="text-blue-600 hover:text-blue-800" />
                  </Link>
                  {currentAdmin?.role === 'Admin' && (
                    <button onClick={() => handleDelete(user._id)}>
                      <FaTrash className="text-red-600 hover:text-red-800" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientTable;