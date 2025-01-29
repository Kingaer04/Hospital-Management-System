import React, { useState, useEffect } from 'react'
import statesAndLGAs from './stateLGA';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function General() {
    const [image, setImage] = useState(null);
    const hospitalName = "NHMIS Hospital"; // Replace with actual hospital name
    const initials = hospitalName.split(' ').map(word => word[0]).join('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [showMessage, setShowMessage] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate
    const { currentAdmin } = useSelector((state) => state.admin); 
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profileImage, setProfileImage] = useState(currentAdmin?.avatar || '/default-avatar.png');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setLoading(true);
        setUploadProgress(0);

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'Hospital_management_profile');
        data.append('cloud_name', 'dyc0ssabt');

        const xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dyc0ssabt/image/upload', true);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentComplete); // Update upload progress
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText);
                setProfileImage(uploadedImageUrl.url); // Update the profileImage state with the new URL
                showMessageWithTimeout("Image uploaded successfully!", 'success');
            } else {
                showMessageWithTimeout("Image upload failed: " + xhr.statusText, 'error');
            }
            setLoading(false);
            setUploadProgress(0);
        };

        xhr.onerror = () => {
            showMessageWithTimeout("Image upload failed: Network error", 'error');
            setLoading(false);
            setUploadProgress(0);
        };

        xhr.send(data);
    };

    const handleImageDelete = () => {
        setImage(null);
    };
    const [selectedState, setSelectedState] = useState('');
    const [lgas, setLgas] = useState([]);

    useEffect(() => {
        if (selectedState) {
            setLgas(statesAndLGAs[selectedState] || []);
        } else {
            setLgas([]);
        }
    }, [selectedState]);
    const [selectedLGA, setSelectedLGA] = useState('');

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedLGA('');
    };

    const handleLGAChange = (e) => {
        setSelectedLGA(e.target.value);
    };

    return (
        <div className='max-w-[800px]'>
            <div>
                <h1 className='font-semibold text-[18px]'>
                    General
                </h1>
                <p className='text-[#A9A9A9] text-[12px]'>
                    Update your Hospital Persona
                </p>
            </div>
            <hr className='w-[100%]'/>
            <div className='mt-3'>
                <h1 className='font-semibold text-[14px] mb-3'>
                    Hospital Details
                </h1>
                <div>
                    <div className='flex gap-10'>
                        {image ? (
                            <img 
                                src={image} 
                                alt="Hospital" 
                                className='w-[10px] h-[10px] object-cover cursor-pointer' 
                                onClick={() => document.getElementById('imageUpload').click()}
                                title="Click to change or upload image"
                            />
                        ) : (
                            <div 
                                className='w-[35px] h-[35px] flex items-center justify-center bg-[#F5FFFE] text-[14px] cursor-pointer rounded-full font-semibold text-[#00A272]' 
                                onClick={() => document.getElementById('imageUpload').click()}
                                title="Click to change or upload image"
                            >
                                {initials}
                            </div>
                        )}
                        <div style={{ display: 'none' }}>
                            <input id="imageUpload" type="file" onChange={handleImageUpload} />
                        </div>
                        <button onClick={handleImageDelete} className='bg-[#FFEBEB] text-[#FF0000] border border-[#FF0000] text-[14px] p-1 pl-3 pr-3 rounded-[5px]'>Delete</button>
                    </div>
                </div>
                <div className='mt-7'>
                    <div className='flex gap-16'> 
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalName" className='text-[14px] font-semibold'>
                                Hospital Name
                            </label>
                            <input type="text" id="hospitalName" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={hospitalName} readOnly/>
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>
                                Email Address
                            </label>
                            <input type="email" id="hospitalEmail" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>
                        </div>
                    </div>
                    <div className='mt-5 w-[45.5%]'>
                        <label htmlFor="hospitalPhoneNumber" className='text-[14px] font-semibold'>
                            Phone Number
                        </label>
                        <input type="text" id="hospitalPhoneNumber" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>    
                    </div>
                </div>
                <hr className='mt-5'/>
                <div>
                    <h1 className='font-semibold text-[14px] mt-3'>
                        Address
                    </h1>
                    <div className='flex gap-16'>
                        <div className='w-[45.5%]'>
                            <select 
                                id="hospitalState" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'
                                value={selectedState}
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
                                id="hospitalLGA" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'
                                value={selectedLGA}
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
                            <label htmlFor="hospitalAddressNumber" className='text-[14px] text-[#A9A9A9]'>
                                Number
                            </label>
                            <input type="text" id="hospitalAddressNumber" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalStreet" className='text-[14px] text-[#A9A9A9]'>
                                Street
                            </label>
                            <input type="text" id="hospitalStreet" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
