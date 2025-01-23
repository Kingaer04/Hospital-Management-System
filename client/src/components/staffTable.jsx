import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash } from 'react-icons/fa';

const StaffTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // State for role filter
  const { currentAdmin } = useSelector((state) => state.admin);
  const hospital_ID = currentAdmin._id;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/admin/staffDetails/${hospital_ID}`, {
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
        if (Array.isArray(result.staff)) {
          setData(result.staff);
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

  const handleDelete = (id) => {
    // Implement delete logic here
    console.log(`Delete staff with ID: ${id}`);
  };

  const handleEdit = (id) => {
    // Implement edit logic here
    console.log(`Edit staff with ID: ${id}`);
  };

  // Filtering logic
  const filteredData = data.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter ? user.role === roleFilter : true) // Apply role filter
  );

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <div className='flex gap-3'>
        <div>
          <input
            type="text"
            placeholder="Search by name..."
            className="mb-4 p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex border h-[42px] rounded-lg items-center p-2 bg-[#EEFFFC]'>
        <img src='/Icons/FilterIcon.png' className='w-4 h-4 mb-3 mt-4'/>
          <select
            className="mb-4 p-2 rounded mt-4 bg-transparent text-[#00A272] font-semibold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Filter</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Doctor">Doctor</option>
            <option value="Receptionist">Receptionist</option>
          </select>
        </div>
      </div>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr className="bg-[#00a272] text-white">
          <th className="py-3 px-4 text-left"></th>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Phone Number</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Role</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((user, index) => (
            <tr key={user.id} className={`border-b transition duration-300 ease-in-out ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-green-100`}>
              <td className="py-3 px-4"><input type="checkbox" /></td>
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4">{user.phone}</td>
              <td className="py-3 px-4">{user.email}</td>
              <td className="py-3 px-4">{user.role}</td>
              <td className="py-3 px-4 flex space-x-2">
                <button onClick={() => handleEdit(user.id)}>
                  <FaEdit className="text-blue-600 hover:text-blue-800" />
                </button>
                {currentAdmin.role === 'Admin' && (
                  <button onClick={() => handleDelete(user.id)}>
                    <FaTrash className="text-red-600 hover:text-red-800" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;