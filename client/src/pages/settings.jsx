import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import General from '../components/SettingsComponents/general';

function Account() {
    return <div>Account Settings</div>;
}

function Preference() {
    return <div>Preference Settings</div>;
}

function Notification() {
    return <div>Notification Settings</div>;
}

import { useState } from 'react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <General />;
            case 'preference':
                return <Preference />;
            case 'notification':
                return <Notification />;
            case 'account':
                return <Account />;
            default:
                return <General />;
        }
    };

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
                        <button className='text-[#00A272] bg-[#F5FFFE] p-1 pr-4 pl-4 rounded-[7px]'>
                            Cancel
                        </button>
                        <button className='text-white bg-[#00A272] p-1 pr-4 pl-4 rounded-[7px]'>
                            Save
                        </button>
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