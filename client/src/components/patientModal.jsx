import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';

const PatientModal = ({ patient, onClose }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Safely access nested properties
  useEffect(() => {
    // Check if the patient is registered in the current user's hospital
    // Make sure we safely access nested properties
    const patientHospitalId = patient?.hospital_ID?._id;
    
    if (currentUser?.hospital_ID && patientHospitalId) {
      setIsRegistered(currentUser.hospital_ID === patientHospitalId);
    }
  }, [currentUser, patient]);
  
  // Handle missing or incomplete data
  if (!patient) {
    return null;
  }
  
  // Safely access nested hospital address properties
  const hospitalName = patient?.hospital_ID?.hospital_Name || 'N/A';
  const hospitalAddress = patient?.hospital_ID?.hospital_Address;
  
  let formattedAddress = 'Address not available';
  if (hospitalAddress) {
    const addressParts = [
      hospitalAddress.number,
      hospitalAddress.street,
      hospitalAddress.lga,
      hospitalAddress.state
    ].filter(Boolean); // Filter out undefined or empty values
    
    if (addressParts.length > 0) {
      formattedAddress = addressParts.join(', ');
    }
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-1/2 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2"
          aria-label="Close modal"
        >
          <CloseIcon sx={{ color: '#00A272' }} />
        </button>
        
        {/* Patient avatar with fallback */}
        {patient.avatar ? (
          <img 
            src={patient.avatar} 
            alt={`${patient.first_name || ''} ${patient.last_name || ''}`} 
            className="w-24 h-24 rounded-full my-4 mx-auto border-2 border-[#00A272] object-cover" 
          />
        ) : (
          <div className="w-24 h-24 rounded-full my-4 mx-auto border-2 border-[#00A272] bg-gray-200 flex items-center justify-center text-[#00A272] font-bold text-xl">
            {patient.first_name?.[0] || ''}{patient.last_name?.[0] || ''}
          </div>
        )}
        
        {/* Patient details */}
        <div className="space-y-2">
          <p className='text-gray-700'>
            Name: <span className='font-semibold'>{patient.first_name || ''} {patient.last_name || ''}</span>
          </p>
          <p className='text-gray-700'>
            Email: <span className="font-semibold">{patient.email || 'N/A'}</span>
          </p>
          <p className='text-gray-700'>
            Hospital Name: <span className='font-semibold'>{hospitalName}</span>
          </p>
          <p className='text-gray-700'>
            Hospital Address: <span className='font-semibold'>{formattedAddress}</span>
          </p>
          <p className='text-gray-700'>
            Status: <span className={`font-semibold ${isRegistered ? 'text-green-600' : 'text-red-600'}`}>
              {isRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClose} 
            className='bg-red-500 text-white rounded-sm p-2 mr-2 hover:bg-red-600 transition-colors'
          >
            Close
          </button>
          {isRegistered ? (
            <a 
              href={`/booking-appointments/${patient._id}`} 
              className='bg-[#00A272] text-white rounded-sm p-2 hover:bg-[#008f63] transition-colors'
            >
              Book Appointment
            </a>
          ) : (
            <a 
              href={`/request/${patient._id}`} 
              className='bg-[#00A272] text-white rounded-sm p-2 hover:bg-[#008f63] transition-colors'
            >
              Request to Book Appointment
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientModal;
