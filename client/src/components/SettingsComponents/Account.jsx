import React, { useState, useEffect } from 'react'
import DeactivateModal from './deactivateModal';
import DeleteAccountModal from './deleteAccountModal';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Account() {
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
    const [adminAccount, setAdminAccount] = useState({
        hospital_Representative_Name: currentAdmin.hospital_Representative || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

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

    const[isDeactivateAccount, setIsDeactivateAccount] = useState(false)
    const[isDeleteAccount, setIsDeleteAccount] = useState(false)

    const handleDeactivateOnClick = () => {
        setIsDeactivateAccount(true)
    }
    const handleDeleteOnClick = () => {
        setIsDeleteAccount(true)
    }

    const handleChange = (event) => {
        const {name, value} = event.target;
        setAdminAccount(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    return (
        <div className='max-w-[800px]'>
            <div>
                <h1 className='font-semibold text-[18px]'>
                    Account
                </h1>
                <p className='text-[#A9A9A9] text-[12px]'>
                    Manage your Personal Information
                </p>
            </div>
            <hr className='w-[100%]'/>
            <div className='mt-3'>
                <h1 className='font-semibold text-[14px] mb-3'>
                    My Profile
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
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>
                                Representative Name
                            </label>
                            <input type="text" id="hospitalEmail" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={adminAccount.hospital_Representative_Name} onChange={handleChange}/>
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>
                                Old Password
                            </label>
                            <input type="password" id="hospitalEmail" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'value={oldPassword} onChange={handleChange}/>
                        </div>
                    </div>
                    <div className='flex gap-16'>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="newHospitalPassword" className='text-[14px] font-semibold'>
                                New Password
                            </label>
                            <input type="password" name="newHospitalPassword" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'value={newPassword} onChange={handleChange}/>
                        </div>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="confirmHospitalPassword" className='text-[14px] font-semibold'>
                                Confirm Password
                            </label>
                            <input type="password" name="confirmHospitalPassword" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={confirmPassword} onChange={handleChange}/>
                        </div>
                    </div>
                </div>
                <hr className='mt-5'/>
                <h1 className='mt-5 font-semibold'>
                    De-Activate Account
                </h1>
                <div className='flex mt-3 justify-between items-start'>
                    <div className='max-w-[350px]'>
                        <p>
                            We're sorry to see you go! Deactivation is temporary. Your profile will you're ready to come back. Your account will be deactivated but your Information will be saved.
                        </p>
                    </div>
                    <div className='flex gap-5 flex-shrink-0'>
                        <button 
                            className='text-[#FFF] bg-[#00A272] p-2 rounded-[7px] whitespace-nowrap'
                            onClick={() => handleDeactivateOnClick()}
                        >
                            Deactivate Account
                        </button>
                        <button className='text-white bg-[#FF0000] p-2 rounded-[7px] whitespace-nowrap' onClick={() => handleDeleteOnClick()}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
            <DeactivateModal isOpen={isDeactivateAccount} onClose={() => setIsDeactivateAccount(false)}/>
            <DeleteAccountModal isOpen={isDeleteAccount} onClose={() => setIsDeleteAccount(false)}/>
        </div>
    );
}
