import React, { useState, useEffect, useRef } from 'react';

const RequestPage = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);
    const [quality, setQuality] = useState('');
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const testRef = useRef(null); // Use ref to store the FingerprintSdkTest instance

    // Fingerprint SDK
    const FingerprintSdkTest = function () {
        this.sdk = new Fingerprint.WebApi();

        // Event handler for acquired samples
        this.sdk.onSamplesAcquired = (s) => {
            console.log("Samples acquired:", s);
            if (s && s.samples) {
                try {
                    const samples = JSON.parse(s.samples);
                    // Assuming the first sample is the one we want
                    console.log(Fingerprint.b64UrlTo64(samples[0]))
                    setFingerprint("data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]));
                } catch (error) {
                    console.error("Failed to parse samples:", error);
                    setScannerError("Failed to process fingerprint data.");
                }
            } else {
                console.error("No samples data received.");
                setScannerError("No fingerprint data received.");
            }
        };

        // Start capturing method
        this.startCapture = function () {
            this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(() => {
                console.log("You can start capturing !!!");
                setAcquisitionStarted(true);
            }).catch((error) => {
                console.error("Error starting capture:", error.message);
                setScannerError(error.message);
            });
        };

        // Stop capturing method
        this.stopCapture = function () {
            this.sdk.stopAcquisition().then(() => {
                console.log("Capturing stopped !!!");
                setAcquisitionStarted(false);
            }).catch((error) => {
                console.error("Error stopping capture:", error.message);
                setScannerError(error.message);
            });
        };
    };

    useEffect(() => {
        testRef.current = new FingerprintSdkTest(); // Initialize the SDK instance
    }, []); // Run only once when the component mounts

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setScannerError(null);
        setFingerprint(null);
        if (option === 'fingerprint') {
            document.getElementById('fingerprintCaptureSection').style.display = 'block';
        } else {
            document.getElementById('fingerprintCaptureSection').style.display = 'none';
        }
    };

    const handleFingerprintScan = () => {
        setScannerError('');
        setQuality('');
        if (testRef.current) {
            testRef.current.startCapture(); // Call startCapture on the test instance
        } else {
            console.error('Fingerprint SDK instance is not initialized.');
        }
    };

    const handleStopCapture = () => {
        if (testRef.current) {
            testRef.current.stopCapture(); // Call stopCapture on the test instance
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Patient Data Request</h2>
                <div className="flex justify-around mt-8 space-x-4">
                    <div className="card" onClick={() => handleOptionClick('fingerprint')}>
                        <div className="p-4 bg-blue-500 shadow rounded-lg text-center cursor-pointer h-40 w-40 flex flex-col justify-center items-center">
                            <h3 className="text-lg font-medium text-white">Patient Fingerprint</h3>
                        </div>
                    </div>
                </div>

                {/* Fingerprint Capture Section */}
                <div id="fingerprintCaptureSection" style={{ display: 'none' }} className="mt-8 border p-4 rounded-lg bg-white">
                    {fingerprint ? (
                        <div className="text-center">
                            <img src={fingerprint} alt="Captured Fingerprint" className="w-32 h-32" />
                            <p className="mt-2 text-sm text-gray-600">Fingerprint Verified</p>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No fingerprint captured yet.</p>
                    )}
                    <div className="flex justify-around mt-4">
                        <button
                            onClick={handleFingerprintScan}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            disabled={acquisitionStarted}
                        >
                            Start Scan
                        </button>
                        <button
                            onClick={handleStopCapture}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            disabled={!acquisitionStarted}
                        >
                            Stop Scan
                        </button>
                    </div>
                    {scannerError && <p className="mt-2 text-sm text-red-600">{scannerError}</p>}
                    {quality && <p className="mt-2 text-sm text-gray-600">Quality: {quality}</p>}
                </div>
            </div>
        </div>
    );
};

export default RequestPage;