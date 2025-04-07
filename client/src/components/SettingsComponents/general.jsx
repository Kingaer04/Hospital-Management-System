import React, { useState, useEffect } from 'react';
import statesAndLGAs from './stateLGA';
import { useDispatch, useSelector } from 'react-redux';

export default function General({ updateGeneralSettings }) {
    const { currentAdmin } = useSelector((state) => state.admin);
    const [generalSettings, setGeneralSettings] = useState({
        hospital_Name: currentAdmin.hospital_Name || '',
        hospital_Email: currentAdmin.hospital_Email || '',
        hospital_Address: {
            hospital_State: currentAdmin?.hospital_Address?.state || '',
            hospital_LGA: currentAdmin.hospital_Address?.lga || '',
            hospital_Address_Number: currentAdmin.hospital_Address?.number || '',
            hospital_Address_Street: currentAdmin.hospital_Address?.street || '',
        },
        hospital_Phone: currentAdmin.hospital_Phone || '',
    });

    const [selectedState, setSelectedState] = useState(generalSettings.hospital_Address.hospital_State);
    const [selectedLGA, setSelectedLGA] = useState(generalSettings.hospital_Address.hospital_LGA);
    const [lgas, setLgas] = useState([]);

    useEffect(() => {
        if (selectedState) {
            setLgas(statesAndLGAs[selectedState] || []);
        } else {
            setLgas([]);
        }
    }, [selectedState]);

    const handleStateChange = (e) => {
        const state = e.target.value;
        setSelectedState(state);
        setSelectedLGA('');
        setGeneralSettings(prevSettings => ({
            ...prevSettings,
            hospital_Address: {
                ...prevSettings.hospital_Address,
                hospital_State: state,
                hospital_LGA: '', // Reset LGA when state changes
            }
        }));
        updateGeneralSettings('hospital_Address', {
            ...generalSettings.hospital_Address,
            hospital_State: state,
            hospital_LGA: ''
        });
    };

    const handleLGAChange = (e) => {
        const lga = e.target.value;
        setSelectedLGA(lga);
        setGeneralSettings(prevSettings => ({
            ...prevSettings,
            hospital_Address: {
                ...prevSettings.hospital_Address,
                hospital_LGA: lga,
            }
        }));
        updateGeneralSettings('hospital_Address', {
            ...generalSettings.hospital_Address,
            hospital_LGA: lga
        });
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setGeneralSettings(prevSettings => ({
            ...prevSettings,
            [name]: value
        }));
        updateGeneralSettings(name, value);
    }

    const handleAddressChange = (name, value) => {
        setGeneralSettings((prevState) => ({
          ...prevState,
          hospital_Address: {
            ...prevState.hospital_Address,
            [name]: value
          }
        }));
        updateGeneralSettings('hospital_Address', {
            ...generalSettings.hospital_Address,
            [name]: value
        })
      };

    return (
        <div className='max-w-[800px]'>
            <div>
                <h1 className='font-semibold text-[18px]'>General</h1>
                <p className='text-[#A9A9A9] text-[12px]'>Update your Hospital Persona</p>
            </div>
            <hr className='w-[100%]' />
            <div className='mt-3'>
                <h1 className='font-semibold text-[14px] mb-3'>Hospital Details</h1>
                <div className='mt-7'>
                    <div className='flex gap-16'> 
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalName" className='text-[14px] font-semibold'>Hospital Name</label>
                            <input type="text" name="hospital_Name" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={generalSettings.hospital_Name} onChange={handleChange}/>
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>Email Address</label>
                            <input type="email" name="hospital_Email" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={generalSettings.hospital_Email} onChange={handleChange}/>
                        </div>
                    </div>
                    <div className='mt-5 w-[45.5%]'>
                        <label htmlFor="hospitalPhoneNumber" className='text-[14px] font-semibold'>Phone Number</label>
                        <input type="text" name="hospital_Phone" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={generalSettings.hospital_Phone} onChange={handleChange}/>    
                    </div>
                </div>
                <hr className='mt-5'/>
                <div>
                    <h1 className='font-semibold text-[14px] mt-3'>Address</h1>
                    <div className='flex gap-16'>
                        <div className='w-[45.5%]'>
                            <select 
                                name="hospital_Address_state" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'
                                value={generalSettings.hospital_Address.hospital_State} 
                                onChange={handleStateChange}
                            >
                                <option value="">Select State</option>
                                {Object.keys(statesAndLGAs).map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div className='w-[45.5%]'>
                            <select 
                                id="hospital_LGA" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'
                                value={generalSettings.hospital_Address.hospital_LGA}
                                onChange={handleLGAChange}
                                disabled={!selectedState}
                            >
                                <option value="">Select LGA</option>
                                {lgas.map((lga) => (
                                    <option key={lga} value={lga}>{lga}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='flex gap-16 mt-5'>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospital_Address_Number" className='text-[14px] text-[#A9A9A9]'>Number</label>
                            <input type="text" name="hospital_Address_Number" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' onChange={(e) => handleAddressChange('hospital_Address_Number', e.target.value)}/>
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospital_Address_Street" className='text-[14px] text-[#A9A9A9]'>Street</label>
                            <input type="text" name="hospital_Address_Street" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' onChange={(e) => handleAddressChange('hospital_Address_Street', e.target.value)}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
