import React, { useState, useEffect, useRef } from 'react';

const RequestPage = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);
    const [qualityMessage, setQualityMessage] = useState('');
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const [ridgeClarity, setRidgeClarity] = useState(0); // Track ridge clarity
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const testRef = useRef(null);

    // Cloudinary configuration
    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dyc0ssabt/image/upload';
    const uploadPreset = 'Hospital_management_profile'; // Your upload preset

    const assessImageQuality = (imageData) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Calculate ridge clarity (using edge detection)
                let edges = 0;
                for (let y = 1; y < canvas.height - 1; y++) {
                    for (let x = 1; x < canvas.width - 1; x++) {
                        const idx = (y * canvas.width + x) * 4;
                        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        const right = (data[idx + 4] + data[idx + 1 + 4] + data[idx + 2 + 4]) / 3;
                        const bottom = (data[idx + canvas.width * 4] + data[idx + canvas.width * 4 + 1] + data[idx + canvas.width * 4 + 2]) / 3;

                        if (Math.abs(current - right) > 20 || Math.abs(current - bottom) > 20) {
                            edges++;
                        }
                    }
                }
                const ridgeClarity = edges / (canvas.width * canvas.height);
                
                resolve({
                    ridgeClarity: Math.round(ridgeClarity * 100),
                });
            };
            img.src = imageData;
        });
    };

    const FingerprintSdkTest = function () {
        this.sdk = new Fingerprint.WebApi();

        this.sdk.onSamplesAcquired = async (s) => {
            if (s && s.samples) {
                try {
                    const samples = JSON.parse(s.samples);
                    const base64Image = "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]);
                    setFingerprint(base64Image);
                    
                    // Assess quality
                    const qualityResults = await assessImageQuality(base64Image);
                    setRidgeClarity(qualityResults.ridgeClarity); // Update ridge clarity state
                    if (qualityResults.ridgeClarity > 30) {
                        setQualityMessage("Good, click on the save button to save the image.");
                        setScannerError(null); // Clear error if quality is good
                    } else {
                        setQualityMessage("Poor image, please retake.");
                        setScannerError("Poor quality fingerprint detected. Please try again.");
                    }
                } catch (error) {
                    console.error("Failed to process samples:", error);
                    setScannerError("Failed to process fingerprint data.");
                }
            } else {
                console.error("No samples data received.");
                setScannerError("No fingerprint data received.");
            }
        };

        this.startCapture = function () {
            this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(() => {
                setAcquisitionStarted(true);
            }).catch((error) => {
                console.error("Error starting capture:", error.message);
                setScannerError(error.message);
            });
        };

        this.stopCapture = function () {
            this.sdk.stopAcquisition().then(() => {
                setAcquisitionStarted(false);
            }).catch((error) => {
                console.error("Error stopping capture:", error.message);
                setScannerError(error.message);
            });
        };
    };

    useEffect(() => {
        testRef.current = new FingerprintSdkTest();
    }, []);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setScannerError(null);
        setFingerprint(null);
        setRidgeClarity(0); // Reset ridge clarity
        setQualityMessage(''); // Reset quality message
        if (option === 'fingerprint') {
            document.getElementById('fingerprintCaptureSection').style.display = 'block';
        } else {
            document.getElementById('fingerprintCaptureSection').style.display = 'none';
        }
    };

    const handleFingerprintScan = () => {
        setScannerError('');
        setQualityMessage('');
        if (testRef.current) {
            testRef.current.startCapture();
        } else {
            console.error('Fingerprint SDK instance is not initialized.');
        }
    };

    const handleFileUpload = (base64Image) => {
        const data = new FormData();
        data.append('file', base64Image);
        data.append('upload_preset', uploadPreset);

        const xhr = new XMLHttpRequest();

        xhr.open('POST', cloudinaryUrl, true);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentComplete); // Update upload progress
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText);
                console.log("Uploaded Image URL: ", uploadedImageUrl.secure_url); // Log the URL
                // Reset the state after upload
                setFingerprint(null);
                setQualityMessage('');
                setRidgeClarity(0);
                setAcquisitionStarted(false);
                setScannerError(null);
            } else {
                console.error("Image upload failed: " + xhr.statusText);
                setScannerError("Image upload failed: " + xhr.statusText);
            }
            setUploadProgress(0);
        };

        xhr.onerror = () => {
            console.error("Image upload failed: Network error");
            setScannerError("Image upload failed: Network error");
            setUploadProgress(0);
        };

        xhr.send(data); // Send the request
    };

    const handleSave = () => {
        if (ridgeClarity > 30 && fingerprint) {
            handleFileUpload(fingerprint); // Upload the fingerprint image to Cloudinary
        } else {
            setScannerError("Ridge clarity is too low. Please retake the fingerprint.");
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

                <div id="fingerprintCaptureSection" style={{ display: 'none' }} className="mt-8 border p-4 rounded-lg bg-white">
                    {fingerprint ? (
                        <div className="text-center">
                            <img src={fingerprint} alt="Captured Fingerprint" className="w-32 h-32" />
                            <p className="mt-2 text-sm text-gray-600">Fingerprint Captured</p>
                            <p className="mt-2 text-sm text-gray-600">{qualityMessage}</p>
                            <p className="mt-2 text-sm text-gray-600">Ridge Clarity Score: {ridgeClarity}%</p>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No fingerprint captured yet.</p>
                    )}
                    <div className="flex justify-around mt-4">
                        <button
                            onClick={handleFingerprintScan}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            disabled={acquisitionStarted || (ridgeClarity > 30 && fingerprint)} // Disable if good fingerprint is captured
                        >
                            Start Scan
                        </button>
                        <button
                            onClick={handleSave}
                            className={`px-4 py-2 rounded ${ridgeClarity > 30 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                            disabled={!fingerprint || ridgeClarity <= 30} // Disable if ridge clarity <= 30
                        >
                            Save
                        </button>
                    </div>
                    {scannerError && <p className="mt-2 text-sm text-red-600">{scannerError}</p>}
                    {uploadProgress > 0 && <p className="mt-2 text-sm text-gray-600">Upload Progress: {uploadProgress}%</p>}
                </div>
            </div>
        </div>
    );
};

export default RequestPage;