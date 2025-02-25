import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close'; // Import close icon

const PatientModal = ({ patient, onClose }) => {
    const { currentUser } = useSelector((state) => state.user);
    const [isRegistered, setIsRegistered] = useState(false);

    // Check if the patient is registered in the current user's hospital
    useEffect(() => {
        if (currentUser.hospital_ID === patient.hospital_ID._id) {
            setIsRegistered(true);
        }
    }, [currentUser.hospital_ID, patient.hospital_ID]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-1/2 relative">
                <button onClick={onClose} className="absolute top-2 right-2">
                    <CloseIcon sx={{ color: '#00A272' }} />
                </button>
                <img src={patient.avatar} alt={`${patient.first_name} ${patient.last_name}`} className="w-24 h-24 rounded-full my-4 mx-auto border-2 border-[#00A272] object-cover" />
                <p className='text-gray-700'>Name: <span className='font-semibold'>{patient.first_name} {patient.last_name}</span></p>
                <p className='text-gray-700'>Email: <span className="font-semibold">{patient.email}</span></p>
                <p className='text-gray-700'>Hospital Name: <span className='font-semibold'>{patient.hospital_ID.hospital_Name}</span></p>
                <p className='text-gray-700'>Hospital Address: <span className='font-semibold'>{patient.hospital_ID.hospital_Address.number}, {patient.hospital_ID.hospital_Address.street}, {patient.hospital_ID.hospital_Address.lga}, {patient.hospital_ID.hospital_Address.state}.</span></p>
                <p className='text-gray-700'>Status: <span className="font-semibold">{isRegistered ? 'Registered' : 'Not Registered'}</span></p>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className='bg-red-500 text-white rounded-sm p-2 mr-2'>
                        Close
                    </button>
                    {isRegistered && (
                        <a href={`/booking-appointments/${patient.id}`} className='bg-[#00A272] text-white rounded-sm p-2'>
                            Book Appointment
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientModal;