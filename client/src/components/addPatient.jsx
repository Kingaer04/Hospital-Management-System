import React, { useState } from 'react';

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 ${
            isActive 
            ? 'border-b-2 border-[#00A272] text-[#00a271d0]' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {label}
    </button>
);

const AddPatient = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('personal');

    return (
        <div>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center top-20">
                    <div className="bg-white rounded-lg w-[800px] p-6 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between mb-4">
                            <h2 className="text-2xl font-bold">Add New Patient</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="mb-6 border-b flex justify-between">
                            <TabButton
                                label="Personal Information"
                                isActive={activeTab === 'personal'}
                                onClick={() => setActiveTab('personal')}
                            />
                            <TabButton
                                label="Next of Kin"
                                isActive={activeTab === 'nextOfKin'}
                                onClick={() => setActiveTab('nextOfKin')}
                            />
                            <TabButton
                                label="Profile & Fingerprint"
                                isActive={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                            />
                        </div>

                        {/* Content based on active tab */}
                        <div className="tab-content">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2">
                                            <option>Select Gender</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <input type="date" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Relationship Status</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2">
                                            <option>Select Status</option>
                                            <option>Single</option>
                                            <option>Married</option>
                                            <option>Divorced</option>
                                            <option>Widowed</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" rows="3"></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <button className="w-full bg-[#00a272] text-white py-2 rounded-md hover:bg-opacity-90">
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'nextOfKin' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2">
                                            <option>Select Gender</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Relationship</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2">
                                            <option>Select Relationship</option>
                                            <option>Mother</option>
                                            <option>Father</option>
                                            <option>Uncle</option>
                                            <option>Aunt</option>
                                            <option>Brother</option>
                                            <option>Sister</option>
                                            <option>Friend</option>
                                            <option>Others</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" rows="3"></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <button className="w-full bg-[#00a272] text-white py-2 rounded-md hover:bg-opacity-90">
                                            Add Patient
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="flex gap-6">
                                    {/* Profile Picture Section */}
                                    <div className="w-1/3">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                <div className="space-y-1 text-center">
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                        >
                                                            <span>Upload a file</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fingerprint Section */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fingerprint</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                <div className="space-y-1 text-center">
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="fingerprint-upload"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                        >
                                                            <span>Upload a file</span>
                                                            <input id="fingerprint-upload" name="fingerprint-upload" type="file" className="sr-only" />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="w-2/3">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Preview</label>
                                            <div className="mt-1 p-4 border-2 border-gray-300 rounded-md">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            className="h-16 w-16 rounded-full"
                                                            src="https://via.placeholder.com/150"
                                                            alt="Profile Preview"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">John Doe</div>
                                                        <div className="text-sm text-gray-500">Patient ID: 123456</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPatient;