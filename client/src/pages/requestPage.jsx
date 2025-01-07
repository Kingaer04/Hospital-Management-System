import React, { useState } from 'react';

const RequestPage = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [reason, setReason] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setScannerError(null);
        setFingerprint(null);
    };

    const checkFingerprintDevice = async () => {
        // Mock implementation, replace with actual device check logic
        return true;
    };
    
    const scanFingerprint = async () => {
        // Mock implementation, replace with actual scanning logic
        return false;
    };
    
    const handleFingerprintScan = async () => {
        try {
            setScannerError(null);
            const isDeviceConnected = await checkFingerprintDevice();

            if (!isDeviceConnected) {
                setScannerError('No fingerprint device found. Please connect a device and try again.');
                return;
            }

            setScannerError('Scanning fingerprint...');
            const isFingerprintScanned = await scanFingerprint();
            if (isFingerprintScanned) {
                setFingerprint(true);
                setScannerError(null);
            } else {
                setScannerError('Fingerprint scan failed. Please try again.');
                setFingerprint(null);
            }
        } catch (error) {
            setScannerError('Error scanning fingerprint. Please try again.');
            setFingerprint(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedOption === 'fingerprint' && !fingerprint) {
            setScannerError('Please scan your fingerprint first');
            return;
        }
        if (selectedOption === 'accessCode' && !accessCode) {
            setScannerError('Please enter the access code');
            return;
        }
        if (selectedOption === 'previousHospital' && !reason) {
            setScannerError('Please fill in all fields');
            return;
        }

        try {
            // Here you would typically make an API call to submit the request
            console.log('Submitting request:', { reason, accessCode, fingerprint });
            // Reset form after successful submission
            setReason('');
            setAccessCode('');
            setFingerprint(null);
            setSelectedOption(null);
        } catch (error) {
            setScannerError('Error submitting request. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Patient Data Request
                </h2>
                <div className="flex justify-around mt-8 space-x-4">
                    <div className="card" onClick={() => handleOptionClick('fingerprint')}>
                        <div className="p-4 bg-blue-500 shadow rounded-lg text-center cursor-pointer h-40 w-40 flex flex-col justify-center items-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                            <h3 className="text-lg font-medium text-white">Patient Fingerprint</h3>
                        </div>
                    </div>
                    <div className="card" onClick={() => handleOptionClick('accessCode')}>
                        <div className="p-4 bg-green-500 shadow rounded-lg text-center cursor-pointer h-40 w-40 flex flex-col justify-center items-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 00-8 0v4H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-3V7z" />
                            </svg>
                            <h3 className="text-lg font-medium text-white">Patient Access Code</h3>
                        </div>
                    </div>
                    <div className="card" onClick={() => handleOptionClick('previousHospital')}>
                        <div className="p-4 bg-red-500 shadow rounded-lg text-center cursor-pointer h-40 w-40 flex flex-col justify-center items-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V9c0-2.21 3.582-4 8-4s8 1.79 8 4v5c0 2.21-3.582 4-8 4z" />
                            </svg>
                            <h3 className="text-lg font-medium text-white">Request from Previous Hospital</h3>
                        </div>
                    </div>
                </div>

                {selectedOption === 'fingerprint' && (
                    <div className="mt-8">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center">
                            {fingerprint ? (
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">Fingerprint Verified</p>
                                </div>
                            ) : (
                                <>
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                    </svg>
                                    <button 
                                        type="button"
                                        className="mt-4 px-4 py-2 bg-[#00A272] text-white rounded-md hover:bg-[#00a271c4] focus:outline-none focus:ring-2 focus:ring-[#00a271c4] focus:ring-offset-2"
                                        onClick={handleFingerprintScan}
                                    >
                                        Scan Fingerprint
                                    </button>
                                    {scannerError && (
                                        <p className="mt-2 text-sm text-red-600">{scannerError}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {selectedOption === 'accessCode' && (
                    <div className="mt-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="mb-4">
                                    <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                                        Enter Access Code
                                    </label>
                                    <input
                                        type="text"
                                        id="accessCode"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00A272] focus:ring-[#00A272]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00A272] hover:bg-[#00a271c4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A272]"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {selectedOption === 'previousHospital' && (
                    <div className="mt-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="mb-4">
                                    <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">
                                        Doctor's Name
                                    </label>
                                    <input
                                        type="text"
                                        id="doctorName"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00A272] focus:ring-[#00A272]"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                                        Reason for Request
                                    </label>
                                    <textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00A272] focus:ring-[#00A272]"
                                        rows="4"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00A272] hover:bg-[#00a271c4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A272]"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestPage;
