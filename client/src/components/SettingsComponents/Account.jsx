import React, { useState, useEffect } from 'react'
import DeactivateModal from './deactivateModal';
import DeleteAccountModal from './deleteAccountModal';

export default function Account() {
    const [image, setImage] = useState(null);
    const hospitalName = "NHMIS Hospital"; // Replace with actual hospital name
    const initials = hospitalName.split(' ').map(word => word[0]).join('');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
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
                            <label htmlFor="hospitalName" className='text-[14px] font-semibold'>
                                First Name
                            </label>
                            <input type="text" id="hospitalName" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' value={hospitalName} readOnly/>
                        </div>
                        <div className='w-[45.5%]'>
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>
                                Last Name
                            </label>
                            <input type="text" id="hospitalEmail" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>
                        </div>
                    </div>
                    <div className='flex gap-16'>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="hospitalPhoneNumber" className='text-[14px] font-semibold'>
                                Phone Number
                            </label>
                            <input type="text" id="hospitalPhoneNumber" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>    
                        </div>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>
                                Email Address
                            </label>
                            <input type="email" id="hospitalEmail" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>
                        </div>
                    </div>
                    <div className='flex gap-16'>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="hospitalPhoneNumber" className='text-[14px] font-semibold'>
                                Date of Birth
                            </label>
                            <input type="text" id="hospitalPhoneNumber" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>    
                        </div>
                        <div className='mt-5 w-[45.5%]'>
                            <label htmlFor="hospitalEmail" className='text-[14px] font-semibold'>
                                Password
                            </label>
                            <input type="password" id="hospitalEmail" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'/>
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
