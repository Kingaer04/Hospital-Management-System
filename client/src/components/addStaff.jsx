import React, { useState } from 'react';

const AddStaffModal = ({ show, handleClose, handleSubmit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [staffData, setStaffData] = useState({
        name: '',
        gender: '',
        address: '',
        email: '',
        phone: '',
        relationshipStatus: '',
        role: '',
        licenseNumber: '',
        nextOfKin: {
            name: '',
            phone: '',
            address: '',
            relationshipStatus: '',
            gender: '',
            email: ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('nextOfKin.')) {
            const field = name.split('.')[1];
            setStaffData(prev => ({
                ...prev,
                nextOfKin: {
                    ...prev.nextOfKin,
                    [field]: value
                }
            }));
        } else {
            setStaffData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const nextStep = () => setCurrentStep(2);
    const prevStep = () => setCurrentStep(1);

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(staffData);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-[800px] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {currentStep === 1 ? 'Add New Staff' : 'Next of Kin Details'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    {currentStep === 1 ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={staffData.name}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={staffData.gender}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={staffData.address}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={staffData.email}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={staffData.phone}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Relationship Status</label>
                                    <select
                                        name="relationshipStatus"
                                        value={staffData.relationshipStatus}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="married">Married</option>
                                        <option value="single">Single</option>
                                        <option value="widow">Widow/Widower</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={staffData.role}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="receptionist">Receptionist</option>
                                    </select>
                                </div>
                                {staffData.role === 'doctor' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">License Number</label>
                                        <input
                                            type="text"
                                            name="licenseNumber"
                                            value={staffData.licenseNumber}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="nextOfKin.name"
                                        value={staffData.nextOfKin.name}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <select
                                        name="nextOfKin.gender"
                                        value={staffData.nextOfKin.gender}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <textarea
                                        name="nextOfKin.address"
                                        value={staffData.nextOfKin.address}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="nextOfKin.email"
                                        value={staffData.nextOfKin.email}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="nextOfKin.phone"
                                        value={staffData.nextOfKin.phone}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Relationship Status</label>
                                    <select
                                        name="nextOfKin.relationshipStatus"
                                        value={staffData.nextOfKin.relationshipStatus}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="married">Married</option>
                                        <option value="single">Single</option>
                                        <option value="widow">Widow/Widower</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        {currentStep === 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2 text-white bg-[#00A272] rounded-md hover:bg-[#00a271d3]"
                                >
                                    Next
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
