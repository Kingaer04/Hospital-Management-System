import React, { useState, useRef, useEffect } from 'react';
import DeactivateModal from './deactivateModal';
import DeleteAccountModal from './deleteAccountModal';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Avatar, LinearProgress } from '@mui/material';

export default function Account({ updateAccount }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentAdmin } = useSelector((state) => state.admin);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profileImage, setProfileImage] = useState(currentAdmin?.avatar || '/default-avatar.png');
    const [adminAccount, setAdminAccount] = useState({
        hospital_Representative: currentAdmin.hospital_Representative || '',
        avatar: currentAdmin?.avatar || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isDeactivateAccount, setIsDeactivateAccount] = useState(false);
    const [isDeleteAccount, setIsDeleteAccount] = useState(false);
    const fileInputRef = useRef(null);

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
                setUploadProgress(percentComplete);
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText);
                setProfileImage(uploadedImageUrl.url);
                setAdminAccount((prev) => ({
                    ...prev,
                    avatar: uploadedImageUrl.url
                }));
                setLoading(false);
                setUploadProgress(0);
                updateAccount('avatar', uploadedImageUrl.url);
            } else {
                console.error("Image upload failed: " + xhr.statusText);
                setLoading(false);
            }
        };

        xhr.onerror = () => {
            console.error("Image upload failed: Network error");
            setLoading(false);
        };

        xhr.send(data);
    };

    const handleImageDelete = () => {
        setProfileImage('/default-avatar.png');
        setAdminAccount((prev) => ({
            ...prev,
            avatar: '/default-avatar.png'
        }));
        updateAccount('avatar', '/default-avatar.png');
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setAdminAccount((prevData) => ({
            ...prevData,
            [name]: value
        }));
        updateAccount(name, value); // Ensure this updates the parent component's state
    };

    const handleDeactivateOnClick = () => {
        setIsDeactivateAccount(true);
    };

    const handleDeleteOnClick = () => {
        setIsDeleteAccount(true);
    };

    useEffect(() => {
        console.log(adminAccount);
    }, [adminAccount]);

    return (
        <div className='max-w-[800px]'>
            <div>
                <h1 className='font-semibold text-[18px]'>Account</h1>
                <p className='text-[#a9a9a9] text-[12px]'>Manage your Personal Information</p>
            </div>
            <hr className='w-[100%]' />
            <div className='mt-3'>
                <h1 className='font-semibold text-[14px] mb-3'>My Profile</h1>
                <div>
                    <div className='flex gap-10'>
                        <img 
                            src={profileImage} 
                            alt={adminAccount.hospital_Representative} 
                            className='w-[40px] h-[40px] object-cover cursor-pointer rounded-full' 
                            onClick={() => fileInputRef.current.click()} 
                            title="Click to change or upload image"
                        />
                        <input 
                            type="file" 
                            hidden 
                            accept='image/*' 
                            onChange={handleImageUpload} 
                            ref={fileInputRef}
                        />
                        <button onClick={handleImageDelete} className='bg-[#FFEBEB] text-[#FF0000] border border-[#FF0000] text-[12px] p-1 pl-3 pr-3 rounded-[5px]'>Delete</button>
                    </div>
                    {loading && <div>Uploading: {uploadProgress}%</div>}
                </div>
                <div className='mt-7'>
                    <div className='flex gap-16'> 
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospital_Representative" className='text-[14px] font-semibold'>Representative Name</label>
                            <input 
                                type="text" 
                                name="hospital_Representative"
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' 
                                value={adminAccount.hospital_Representative} 
                                onChange={handleChange}
                            />
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="oldPassword" className='text-[14px] font-semibold'>Old Password</label>
                            <input 
                                type="password" 
                                id="oldPassword" 
                                name="oldPassword" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' 
                                value={adminAccount.oldPassword} 
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className='flex gap-16'>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="newPassword" className='text-[14px] font-semibold'>New Password</label>
                            <input 
                                type="password" 
                                name="newPassword" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' 
                                value={adminAccount.newPassword} 
                                onChange={handleChange}
                            />
                        </div>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="confirmPassword" className='text-[14px] font-semibold'>Confirm Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' 
                                value={adminAccount.confirmPassword} 
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <hr className='mt-5'/>
                <h1 className='mt-5 font-semibold'>De-Activate Account</h1>
                <div className='flex mt-3 justify-between items-start'>
                    <div className='max-w-[350px]'>
                        <p>
                            We're sorry to see you go! Deactivation is temporary. Your profile will be saved for when you're ready to come back.
                        </p>
                    </div>
                    <div className='flex gap-5 flex-shrink-0'>
                        <button 
                            className='text-[#FFF] bg-[#00A272] p-2 rounded-[7px] whitespace-nowrap'
                            onClick={handleDeactivateOnClick}
                        >
                            Deactivate Account
                        </button>
                        <button className='text-white bg-[#FF0000] p-2 rounded-[7px] whitespace-nowrap' onClick={handleDeleteOnClick}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
            <DeactivateModal isOpen={isDeactivateAccount} onClose={() => setIsDeactivateAccount(false)} />
            <DeleteAccountModal isOpen={isDeleteAccount} onClose={() => setIsDeleteAccount(false)} />
        </div>
    );
}