import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AddVitalsForm = ({ patientData, onClose }) => {
    const {currentUser} = useSelector((state) => state.user)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [vitalSigns, setVitalSigns] = useState({
        bloodPressure: '',
        sugarLevel: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
    });
    const [bloodGroup, setBloodGroup] = useState('');
    const [allergies, setAllergies] = useState('');
    
    const handleVitalChange = (e) => {
        const { name, value } = e.target;
        setVitalSigns(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleAllergiesChange = (e) => {
        setAllergies(e.target.value);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Create medical record data
            const medicalRecordData = {
                patientId: patientData._id,
                personalInfo: {
                    name: `${patientData.first_name} ${patientData.last_name}`,
                    gender: patientData.gender,
                    bloodGroup: bloodGroup,
                    contactNumber: patientData.phone
                },
                allergies: allergies.split(',').map(item => item.trim()).filter(item => item),
                primaryHospitalId: patientData.hospital_ID,
                vitalSigns: vitalSigns,
                receptionistId: currentUser._id
            };
            
            // Calculate age if DoB is available
            if (patientData.patientDoB) {
                const birthDate = new Date(patientData.patientDoB);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                medicalRecordData.personalInfo.age = age;
            }
            
            const res = await fetch('/records/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(medicalRecordData),
            });
            
            const data = await res.json();
            
            if (data.error) {
                console.error("Error creating medical record:", data.error);
                alert("Failed to create medical record: " + data.error);
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Failed to create medical record:", error);
            alert("Failed to create medical record: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    useEffect(() => {
        console.log(patientData)
    }, [])
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[800px] p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-bold text-[#00A272]">Medical Record Information</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="mb-6">
                    <div className="bg-[#f9fbff] p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-[#00A272]">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="px-3 py-2 bg-white rounded-lg shadow-sm">
                                <span className="text-sm text-gray-500">Name</span>
                                <p className="font-medium">{patientData.first_name} {patientData.last_name}</p>
                            </div>
                            <div className="px-3 py-2 bg-white rounded-lg shadow-sm">
                                <span className="text-sm text-gray-500">Gender</span>
                                <p className="font-medium">{patientData.gender}</p>
                            </div>
                            <div className="px-3 py-2 bg-white rounded-lg shadow-sm">
                                <span className="text-sm text-gray-500">ID</span>
                                <p className="font-medium">{patientData.patientID}</p>
                            </div>
                            <div className="px-3 py-2 bg-white rounded-lg shadow-sm">
                                <span className="text-sm text-gray-500">Phone</span>
                                <p className="font-medium">{patientData.phone}</p>
                            </div>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="bg-[#f9fbff] p-4 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-[#00A272]">Vital Signs</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
                                    <input 
                                        type="text" 
                                        name="bloodPressure" 
                                        placeholder="e.g., 120/80" 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={vitalSigns.bloodPressure}
                                        onChange={handleVitalChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                                    <input 
                                        type="text" 
                                        name="heartRate" 
                                        placeholder="e.g., 75" 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={vitalSigns.heartRate}
                                        onChange={handleVitalChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                                    <input 
                                        type="text" 
                                        name="temperature" 
                                        placeholder="e.g., 37.0" 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={vitalSigns.temperature}
                                        onChange={handleVitalChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sugar Level (mg/dL)</label>
                                    <input 
                                        type="text" 
                                        name="sugarLevel" 
                                        placeholder="e.g., 90" 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={vitalSigns.sugarLevel}
                                        onChange={handleVitalChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                    <input 
                                        type="text" 
                                        name="weight" 
                                        placeholder="e.g., 70" 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={vitalSigns.weight}
                                        onChange={handleVitalChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                    <input 
                                        type="text" 
                                        name="height" 
                                        placeholder="e.g., 170" 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={vitalSigns.height}
                                        onChange={handleVitalChange}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-[#f9fbff] p-4 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-[#00A272]">Medical Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2"
                                        value={bloodGroup}
                                        onChange={(e) => setBloodGroup(e.target.value)}
                                    >
                                        <option value="">Select Blood Group</option>
                                        {bloodGroups.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Allergies (comma separated)</label>
                                    <textarea 
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" 
                                        rows="3"
                                        placeholder="e.g., Penicillin, Peanuts, Latex"
                                        value={allergies}
                                        onChange={handleAllergiesChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button 
                                type="submit" 
                                className="bg-[#00A272] text-white py-2 px-6 rounded-md hover:bg-[#008f64] transition-colors flex items-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : "Create Medical Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddVitalsForm;
