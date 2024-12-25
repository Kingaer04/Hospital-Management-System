import React from 'react';

const ViewPatientModal = ({ show, handleClose, patient }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Patient Details</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="p-4">
                    <div className="patient-info">
                        <h5 className="font-semibold text-lg">Personal Information</h5>
                        <p className="mt-2"><span className="font-semibold">Name:</span> {patient?.name}</p>
                        <p className="mt-1"><span className="font-semibold">Phone:</span> {patient?.phone}</p>
                        
                        <h5 className="font-semibold text-lg mt-6">Medical Record Summary</h5>
                        <div className="mt-2">
                            {patient?.medicalSummary ? (
                                <p className="text-gray-700">{patient.medicalSummary}</p>
                            ) : (
                                <p className="text-gray-500">No medical records available.</p>
                            )}
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

export default ViewPatientModal;