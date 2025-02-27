import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import Notification from '@/components/Notification';

const RequestPage = () => {
    const { id } = useParams(); 
    const [fingerprint, setFingerprint] = useState(null);
    const [qualityMessage, setQualityMessage] = useState('');
    const [existingFingerprint, setExistingFingerprint] = useState(null);
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const [ridgeClarity, setRidgeClarity] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [matchedPatientData, setMatchedPatientData] = useState(null);
    const [isFetching, setIsFetching] = useState(true); // New state to track fetching
    const [notification, setNotification] = useState({ message: '', type: '' }); // Notification state
    const testRef = useRef(null);
    const navigate = useNavigate();

    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dyc0ssabt/image/upload';
    const uploadPreset = 'Hospital_management_profile';

    const assessImageQuality = (imageData) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

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
                resolve(Math.round(ridgeClarity * 100));
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
                    
                    const clarity = await assessImageQuality(base64Image);
                    setRidgeClarity(clarity);

                    if (clarity > 30) {
                        setQualityMessage("Good, processing the image...");
                        handleFileUpload(base64Image);
                    } else {
                        setQualityMessage("Poor image, please retake.");
                        setNotification({ message: "Poor quality fingerprint detected. Please try again.", type: 'error' });
                    }
                } catch (error) {
                    console.error("Failed to process samples:", error);
                    setNotification({ message: "Failed to process fingerprint data.", type: 'error' });
                }
            } else {
                setNotification({ message: "No fingerprint data received.", type: 'error' });
            }
        };

        this.startCapture = function () {
            this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(() => {
                setAcquisitionStarted(true);
            }).catch((error) => {
                console.error("Error starting capture:", error.message);
                setNotification({ message: error.message, type: 'error' });
            });
        };

        this.stopCapture = function () {
            this.sdk.stopAcquisition().then(() => {
                setAcquisitionStarted(false);
            }).catch((error) => {
                console.error("Error stopping capture:", error.message);
                setNotification({ message: error.message, type: 'error' });
            });
        };
    };

    useEffect(() => {
        testRef.current = new FingerprintSdkTest();

        const fetchExistingFingerprint = async () => {
            try {
                const response = await fetch(`/recep-patient/fetchFingerprintData/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch existing fingerprint data');
                }
                const data = await response.json();
                setExistingFingerprint(data.fingerprintData);
            } catch (error) {
                setNotification({ message: "Error fetching fingerprint data: " + error.message, type: 'error' });
            } finally {
                setIsFetching(false); // Set fetching to false
            }
        };
        fetchExistingFingerprint();
    }, [existingFingerprint]);

    const handleFingerprintScan = () => {
        setQualityMessage('');
        setMatchedPatientData(null);
        if (testRef.current) {
            testRef.current.startCapture();
        } else {
            console.error('Fingerprint SDK instance is not initialized.');
        }
    };

    const handleFileUpload = async (base64Image) => {
        const data = new FormData();
        data.append('file', base64Image);
        data.append('upload_preset', uploadPreset);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUrl, true);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentComplete);
            }
        });

        xhr.onload = async () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText).secure_url;
                await compareFingerprintWithDatabase(uploadedImageUrl, existingFingerprint);
            } else {
                setNotification({ message: "Image upload failed: " + xhr.statusText, type: 'error' });
            }
            setUploadProgress(0);
        };

        xhr.onerror = () => {
            setNotification({ message: "Image upload failed: Network error", type: 'error' });
            setUploadProgress(0);
        };

        xhr.send(data);
    };

    const compareFingerprintWithDatabase = async (fingerprintUrl, existingFingerprint) => {
        try {
            const response = await fetch('/fingerprint-api/verify', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SavedFingerUrl: existingFingerprint,
                    UserFingerUrl: fingerprintUrl
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to compare fingerprint');
            }

            const data = await response.json();
            if (data.isMatch) {
                setNotification({ message: "Success! You can now book an appointment for the patient.", type: 'success' });
                setTimeout(() => {
                    navigate(`/booking-appointments/${id}`); // Navigate after a delay
                }, 3000); // Delay for 3 seconds
            } else {
                setNotification({ message: "Fingerprints do not match.", type: 'error' });
            }
            setMatchedPatientData(data);
        } catch (error) {
            setNotification({ message: "Error comparing fingerprint: " + error.message, type: 'error' });
        }
    };

    const handleRetake = () => {
        setFingerprint(null);
        setRidgeClarity(0);
        setQualityMessage('');
        handleFingerprintScan(); 
    };

    return (
        <div className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}>
            {notification.message && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ message: '', type: '' })} 
                />
            )}
            <div className="max-w-md mx-auto">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Patient Data Request</h2>
                <div className="flex justify-around mt-8 space-x-4">
                    <div className="card" onClick={handleFingerprintScan}>
                        <div className="p-4 bg-blue-500 shadow rounded-lg text-center cursor-pointer h-40 w-40 flex flex-col justify-center items-center">
                            <h3 className="text-lg font-medium text-white">Scan Fingerprint</h3>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border p-4 rounded-lg bg-white">
                    {fingerprint && (
                        <div className="text-center">
                            <img src={fingerprint} alt="Captured Fingerprint" className="w-32 h-32" />
                            <p className="mt-2 text-sm text-gray-600">{qualityMessage}</p>
                            <p className="mt-2 text-sm text-gray-600">Ridge Clarity Score: {ridgeClarity}%</p>
                        </div>
                    )}
                    {uploadProgress > 0 && <p className="mt-2 text-sm text-gray-600">Upload Progress: {uploadProgress}%</p>}
                    {matchedPatientData && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold">Matched Patient Data:</h3>
                            <pre className="mt-2 bg-gray-100 p-2 rounded">{JSON.stringify(matchedPatientData, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestPage;