import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AppointmentFormPage = () => {
    const { id } = useParams(); // Extract patient ID from URL
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [reason, setReason] = useState('');
    const [patientData, setPatientData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        avatar: '',
    });

    useEffect(() => {
        // Fetch patient data using the patientId
        const fetchPatientData = async () => {
            // console.log(id)
            try {
                const res = await fetch(`/recep-patient/patientData/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
        
                const data = await res.json();
                if (data.error) {
                    console.log(data.error, 'error');
                } else {
                    setPatientData(data.patient);
                }
            } catch (error) {
                console.log(error.message, 'error'); // Improved error logging
            }
        };

        // Fetch doctors for the dropdown
        const fetchDoctors = async () => {
            const response = await fetch('/api/doctors');
            const data = await response.json();
            setDoctors(data);
        };
        fetchDoctors();
        fetchPatientData();
    }, [id])

    const handleSubmit = async (event) => {
        event.preventDefault();

        const appointmentData = {
            patientId: patient._id,
            doctorId: selectedDoctor,
            reason,
            checkin: new Date().toISOString(),
        };

        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
            console.log('Appointment created successfully');
        } else {
            console.error('Failed to create appointment');
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPatientData({ ...patientData, [name]: value });
    }

    if (!patientData) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={patientData.first_name} placeholder="First Name" name="first_name" onChange={handleChange} />
            <input type="text" value={patientData.last_name} readOnly placeholder="Last Name" />
            <input type="email" value={patientData.email} readOnly placeholder="Email" />
            <input type="text" value={patientData.phone} readOnly placeholder="Phone" />
            <textarea
                placeholder="Reason for appointment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
            ></textarea>
            <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
            >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                    </option>
                ))}
            </select>
            <button type="submit" className="bg-blue-500 text-white p-2">Send & Assign</button>
        </form>
    );
};

export default AppointmentFormPage;