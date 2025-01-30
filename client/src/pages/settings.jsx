import { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import General from '../components/SettingsComponents/general';
import NotificationSettings from '@/components/SettingsComponents/notification';
import Preference from '@/components/SettingsComponents/Preference';
import Account from '@/components/SettingsComponents/Account';
import { useSelector } from 'react-redux';

export default function Settings() {
    const { currentAdmin } = useSelector((state) => state.admin);
    const [activeTab, setActiveTab] = useState('general');
    const [generalSettings, setGeneralSettings] = useState({
        hospital_Name: currentAdmin.hospital_Name || '',
        hospital_Representative: currentAdmin.hospital_Representative || '',
        hospital_UID: currentAdmin.hospital_UID || '',
        ownership: currentAdmin.ownership || '',
        hospital_Email: currentAdmin.hospital_Email || '',
        hospital_Address: {
            hospital_State: currentAdmin.hospital_Address.state || '',
            hospital_LGA: currentAdmin.hospital_Address.lga || '',
            hospital_Address_Number: currentAdmin.hospital_Address.number || '',
            hospital_Address_Street: currentAdmin.hospital_Address.street || '',
        },
        hospital_Phone: currentAdmin.hospital_Phone || '',
    });

    const [adminAccount, setAdminAccount] = useState({
        hospital_Representative_Name: currentAdmin.hospital_Representative || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Store initial settings for revert functionality
    const [initialGeneralSettings, setInitialGeneralSettings] = useState(generalSettings);
    const [initialAdminAccount, setInitialAdminAccount] = useState(adminAccount);
    const [hasChanges, setHasChanges] = useState(false);

    const updateAccount = (name, value) => {
        setAdminAccount(prevData => ({
            ...prevData, 
            [name]: value 
        }));
    }

    const updateGeneralSettings = (name, value) => {
        setGeneralSettings(prevData => ({
            ...prevData, 
            [name]: value 
        }));
    }

    // Detect changes in generalSettings
    useEffect(() => {
        setHasChanges(JSON.stringify(initialGeneralSettings) !== JSON.stringify(generalSettings) ||
                      JSON.stringify(initialAdminAccount) !== JSON.stringify(adminAccount));
    }, [generalSettings, adminAccount, initialGeneralSettings, initialAdminAccount]);

    const handleSave = () => {
        // Save changes to the backend
        fetch('/api/updateGeneralSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(generalSettings),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            setInitialGeneralSettings(generalSettings); // Update initial settings
            setInitialAdminAccount(adminAccount); // Update initial account settings
            setHasChanges(false); // Reset change tracker
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const handleCancel = () => {
        // Revert to initial settings
        setGeneralSettings(initialGeneralSettings);
        setAdminAccount(initialAdminAccount);
        setHasChanges(false); // Reset change tracker
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <General updateGeneralSettings={updateGeneralSettings} />;
            case 'preference':
                return <Preference />;
            case 'notification':
                return <NotificationSettings />;
            case 'account':
                return <Account updateAccount={updateAccount} />;
            default:
                return <General />;
        }
    };

    useEffect(() => {
        console.log(adminAccount);
    }, [adminAccount]);

    return (
        <div className='p-5'>
            <div className='mb-5'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-[40px]'>
                            Settings
                        </h1>
                    </div>
                    <div className='flex gap-5'>
                        {hasChanges && (
                            <>
                                <button 
                                    className='text-[#00A272] bg-[#F5FFFE] p-1 pr-4 pl-4 rounded-[7px]'
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className='text-white bg-[#00A272] p-1 pr-4 pl-4 rounded-[7px]'
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <p className='text-gray-500 text-xs font-light'>
                    Manage your account settings
                </p>
            </div>
            <div className='flex border border-gray-300'>
                <nav className='w-48 border-r border-gray-300'>
                    <ul className='p-6 flex flex-col gap-10'>
                        <li>
                            <button
                                onClick={() => setActiveTab('general')}
                                className='rounded-[5px] text-[#00A272] flex items-center gap-2 p-3 bg-[#F5FFFE] transition duration-300 ease-in-out hover:shadow-md hover:bg-gray-100'
                            >
                                <img src='/Icons/GeneralIcon.png' className='w-4 h-4' />
                                General
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('preference')}
                                className='rounded-[5px] text-[#00A272] flex items-center gap-2 p-3 bg-[#F5FFFE] transition duration-300 ease-in-out hover:shadow-md hover:bg-gray-100'
                            >
                                <img src='/Icons/PreferencesIcon.png' className='w-4 h-4' />
                                Preference
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('notification')}
                                className='rounded-[5px] text-[#00A272] flex items-center gap-2 p-3 bg-[#F5FFFE] transition duration-300 ease-in-out hover:shadow-md hover:bg-gray-100'
                            >
                                <img src='/Icons/NotificationIcon.png' className='w-4 h-4' />
                                Notification
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('account')}
                                className='rounded-[5px] text-[#00A272] flex items-center gap-2 p-3 bg-[#F5FFFE] transition duration-300 ease-in-out hover:shadow-md hover:bg-gray-100'
                            >
                                <img src='/Icons/UserIcon.png' className='w-4 h-4' />
                                Account
                            </button>
                        </li>
                    </ul>
                </nav>
                <main className='p-4 overflow-auto flex-auto max-h-[400px]'>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}