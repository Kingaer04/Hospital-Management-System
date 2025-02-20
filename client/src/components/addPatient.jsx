import React, { useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';

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
    const {currentUser} = useSelector((state) => state.user)
    const [activeTab, setActiveTab] = useState('personal');
    const [selectedOption, setSelectedOption] = useState(null);
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);
    const [qualityMessage, setQualityMessage] = useState('');
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const [ridgeClarity, setRidgeClarity] = useState(0); // Track ridge clarity
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const testRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [patientData, setPatientData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        patientID: '',
        patientDoB: '',
        phone: '',
        address: '',
        relationshipStatus: '',
        avatar: profileImage,
        fingerprint_Data: null,
        nextOfKin: {
        name: '',
        phone: '',
        email: '',
        address: '',
        relationshipStatus: '',
        gender: '',
        },
    });

    useEffect(() => {
        console.log(patientData)
    }, [patientData])

    // Cloudinary configuration
    const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET

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
                // console.log("Uploaded Image URL: ", uploadedImageUrl.secure_url); // Log the URL
                // Reset the state after upload
                patientData.fingerprint_Data = uploadedImageUrl.secure_url
                // console.log(patientData.fingerprint_Data)
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

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('nextOfKin')) {
            const kinField = name.split('.')[1]
            setPatientData((prevData) => ({
                ...prevData,
                nextOfKin: {
                    ...prevData.nextOfKin,
                    [kinField]: value
                },
            }));
        } else {
            setPatientData((prevData) => ({
                ...prevData,
                [name]: value
            }))
        }
    }

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
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name="first_name" value={patientData.first_name} onChange={ handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name="last_name" value={patientData.last_name} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='gender' value={patientData.gender} onChange={handleChange}>
                                            <option>Select Gender</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='patientID' value={patientData.patientID} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='phone' value={patientData.phone} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <input type="date" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='patientDoB' value={patientData.patientDoB} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='email' value={patientData.email} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Relationship Status</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='relationshipStatus' value={patientData.relationshipStatus} onChange={handleChange}>
                                            <option>Select Status</option>
                                            <option>Single</option>
                                            <option>Married</option>
                                            <option>Divorced</option>
                                            <option>Widowed</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" rows="3" name='address' value={patientData.address} onChange={handleChange}></textarea>
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
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='nextOfKin.name' value={patientData.nextOfKin.name} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='nextOfKin.gender' value={patientData.nextOfKin.gender} onChange={handleChange}>
                                            <option>Select Gender</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='nextOfKin.phone' value={patientData.nextOfKin.phone} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Relationship</label>
                                        <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='nextOfKin.relationshipStatus' value={patientData.nextOfKin.relationshipStatus} onChange={handleChange}>
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
                                        <textarea className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" rows="3" name='nextOfKin.address' value={patientData.nextOfKin.address} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="flex gap-6">
                                    {/* Profile Picture Section */}
                                    <div className="w-[100%]">
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
                                        <div id="fingerprintCaptureSection" className="mt-8 border p-4 rounded-lg bg-white">
                                            <h2 className="text-xl font-bold text-center mb-4">Capture Fingerprint</h2>
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
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPatient;