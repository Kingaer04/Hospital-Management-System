import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PatientTable from '../components/patientTable.jsx';
import { Calendar } from '@/components/ui/calendar';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import PatientModal from '../components/patientModal';

export default function ReceptionistHome() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchItem, setSearchItem] = useState('');
  const [patientData, setPatientData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
          setSelectedPatient(data[0]); // Assuming you want to show the first patient found
          setModalOpen(true);
      }
  };

  const closeModal = () => {
      setModalOpen(false);
      setPatientData([]); // Reset patient data if needed
      setSearchItem(''); // Clear search input
  };

  useEffect(() => {
    console.log(patientData)
},[])

  return (
    <div className="p-5 w-[100%]">
      <div className="mb-8">
        <h5 className='font-bold text-[18px]'>
          Welcome, {currentUser.name.split(' ')[1]}!
        </h5>
        <p className="text-[#A9A9A9] text-[11px] font-[400]">
          Here's an insight of your activity
        </p>
      </div>
      <div className="flex flex-wrap w-[100%] gap-[5%]">
        <div className="Width">
          {/* Card Rendering */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Card One  */}
            <div className='p-5 w-full sm:w-[calc(33%-1rem)] rounded-[10px] Shadow min-w-[250px]'>
              <p className="text-[15px] text-[#A9A9A9]">
                Total Patient
              </p>
              <div className='mt-8 flex justify-between items-center font-bold'>
                <p>18</p>
                <Diversity1OutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            {/* Card Two  */}
            <div className='p-5 w-full sm:w-[calc(33%-1rem)] rounded-[10px] Shadow min-w-[250px]'>
              <p className="text-[15px] text-[#A9A9A9]">
                Total Staff
              </p>
              <div className='mt-8 flex justify-between items-center font-bold'>
                <p>18</p>
                <BadgeOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
            {/* Card Three  */}
            <div className='p-5 w-full sm:w-[calc(33%-1rem)] rounded-[10px] Shadow min-w-[250px]'>
              <p className="text-[15px] text-[#A9A9A9]">
                Appointment
              </p>
              <div className='mt-8 flex justify-between items-center font-bold'>
                <p>18</p>
                <CalendarMonthOutlinedIcon sx={{ fill: "#00A272" }} />
              </div>
            </div>
          </div>
          <div className='mt-[40px] border border-[#A9A9A9] p-[4%] rounded-[10px]'>
            {/* Search box */}
            <div>
              <p className='font-bold text-[100%]'>
                Search For Patient By Phone or Email
              </p>
              <form onSubmit={handleSearch} className='flex gap-3 mt-3'>
                <input
                  type="text"
                  placeholder="Enter phone or email"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className="border rounded p-2 w-full focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]"
                />
                {searchItem && (
                  <button type="submit" className='bg-[#00A272] text-white text-[65%] rounded-sm p-3'>
                    Search
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className='w-[23%] Flex flex-col Image-container'>
          <div className="border border-[#A9A99A9] rounded-[10px] p-3">
            <Calendar />
          </div>
          <div className='mt-[30px] ml-5'>
            <p>
              Doctor
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Patient Details */}
      {modalOpen && selectedPatient && (
        <PatientModal patient={selectedPatient} onClose={closeModal} />
      )}
    </div>
  );
}