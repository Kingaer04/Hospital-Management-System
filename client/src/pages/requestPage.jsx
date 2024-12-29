import React, { useState } from 'react';

const RequestPage = () => {
    const [reason, setReason] = useState('');
    const [department, setDepartment] = useState('');
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);

    // Mock function to check if fingerprint device is connected
    const checkFingerprintDevice = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const isConnected = Math.random() > 0.5;
                resolve(isConnected);
            }, 1000);
        });
    };

    // Mock function to scan fingerprint
    const scanFingerprint = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 2000);
        });
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
            await scanFingerprint();
            setFingerprint(true);
            setScannerError(null);
        } catch (error) {
            setScannerError('Error scanning fingerprint. Ple</svg>ase try again.');
            setFingerprint(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fingerprint) {
            setScannerError('Please scan your fingerprint first');
            return;
        }
        if (!reason || !department) {
            setScannerError('Please fill in all fields');
            return;
        }

        try {
            // Here you would typically make an API call to submit the request
            console.log('Submitting request:', { reason, department, fingerprint });
            // Reset form after successful submission
            setReason('');
            setDepartment('');
            setFingerprint(null);
        } catch (error) {
            setScannerError('Error submitting request. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Patient Data Request Form
                </h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">
                                Requesting Doctor's Name
                            </label>
                            <input
                                type="text"
                                id="doctorName"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00A272] focus:ring-[#00A272]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                                Patient Name
                            </label>
                            <input
                                type="text"
                                id="patientName"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00A272] focus:ring-[#00A272]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                                Patient ID
                            </label>
                            <input
                                type="text"
                                id="patientId"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00A272] focus:ring-[#00A272]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Data Requested (Select all that apply)
                            </label>
                            <div className="mt-2 space-y-2">
                                <label className="inline-flex items-center">
                                    <input type="checkbox" className="form-checkbox text-[#00A272]" />
                                    <span className="ml-2">Medical History</span>
                                </label>
                                <br/>
                                <label className="inline-flex items-center">
                                    <input type="checkbox" className="form-checkbox text-[#00A272]" />
                                    <span className="ml-2">Lab Results</span>
                                </label>
                                <br/>
                                <label className="inline-flex items-center">
                                    <input type="checkbox" className="form-checkbox text-[#00A272]" />
                                    <span className="ml-2">Prescription History</span>
                                </label>
                            </div>
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

                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center">
                            {fingerprint ? (
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">Doctor's Fingerprint Verified</p>
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
                                        Verify Patient's Fingerprint
                                    </button>
                                    {scannerError && (
                                        <p className="mt-2 text-sm text-red-600">{scannerError}</p>
                                    )}
                                </>
                            )}
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
        </div>
    );
};

export default RequestPage;
