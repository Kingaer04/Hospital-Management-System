import React from 'react';

const ViewStaffModal = ({ show, handleClose, staff }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Staff Details</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="p-4">
                    <div className="staff-info">
                        {staff?.image && (
                            <div className="flex justify-center mb-4">
                                <img 
                                    src={staff.image} 
                                    alt="Staff"
                                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                        )}

                        <h5 className="font-semibold text-lg">Personal Information</h5>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <p><span className="font-semibold">Name:</span> {staff?.name}</p>
                            <p><span className="font-semibold">Phone:</span> {staff?.phone}</p>
                            <p><span className="font-semibold">Email:</span> {staff?.email}</p>
                            <p><span className="font-semibold">Marital Status:</span> {staff?.maritalStatus}</p>
                            <p><span className="font-semibold">Role:</span> {staff?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStaffModal;
