import React, { useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AddVitalsForm from './vitalForm';

const TabButton = ({ label, isActive, onClick, disabled }) => (
    <button
        onClick={disabled ? null : onClick}
        className={`px-4 py-2 ${isActive ? 'border-b-2 border-[#00A272]' : 'text-gray-500 hover:text-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
    >
        {label}
    </button>
)

const AddPatient = ({ isOpen, onClose }) => {
    const navigate = useNavigate()
    const defaultImage = '/Icons/default-image.jpeg'
    const [showVitals, setShowVitals] = useState(false);
    const [newPatientData, setNewPatientData] = useState(null)
    const {currentUser} = useSelector((state) => state.user)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('personal');
    const [selectedOption, setSelectedOption] = useState(null);
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);
    const [qualityMessage, setQualityMessage] = useState('');
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const [ridgeClarity, setRidgeClarity] = useState(0); // Track ridge clarity
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const testRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isPersonalFilled, setIsPersonalFilled] = useState(false);
    const [isNextOfKinFilled, setIsNextOfKinFilled] = useState(false);
    const [profileImage, setProfileImage] = useState(defaultImage);
    const [lastPatientId, setLastPatientId] = useState(null)
    const [patientData, setPatientData] = useState({
        hospital_ID: currentUser.hospital_ID,
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        patientID: '',
        patientDoB: '',
        phone: '',
        address: '',
        relationshipStatus: '',
        avatar: '',
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
    }, [patientData]);

     // Fetch the last patient ID when component mounts
     useEffect(() => {
        const fetchLastPatientId = async () => {
            try {
                const res = await fetch(`/recep-patient/lastPatientId/${currentUser.hospital_ID}`);
                const data = await res.json();
                console.log("Current Patient ID:", data);
                setLastPatientId(data.lastPatientId);

                // Generate the next patient ID
                const nextPatientId = generateNextPatientId(data.lastPatientId);
                setPatientData(prev => ({
                    ...prev,
                    patientID: nextPatientId
                }));
            } catch (error) {
                console.error("Failed to fetch last patient ID:", error);
                // Fallback to manual generation if fetch fails
                const fallbackId = `NHM/${String(Date.now()).slice(-7)}`;
                setPatientData(prev => ({
                    ...prev,
                    patientID: fallbackId
                }));
            }
        };

        fetchLastPatientId();
    }, [currentUser.hospital_ID]);

    // Helper function to generate next patient ID
    const generateNextPatientId = (lastId) => {
        if (!lastId) return 'NHM/0000001'; 

        // Extract the numeric part
        const match = lastId.match(/NHM\/(\d+)/);
        if (!match) return 'NHM/0000001';

        // Increment the numeric part
        const currentNumber = parseInt(match[1], 10);
        const nextNumber = currentNumber + 1;
        
        // Pad with zeros to maintain 7 digits
        return `NHM/${String(nextNumber).padStart(7, '0')}`;
    };

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
        data.append('cloud_name', 'dyc0ssabt');
        data.append('upload_preset', 'Hospital_management_profile');

        const xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dyc0ssabt/image/upload', true);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentComplete); // Update upload progress
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText);
                patientData.fingerprint_Data = uploadedImageUrl.secure_url
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

    const checkPersonalFilled = () => {
        const { first_name, last_name, email, gender, patientID, phone, address, relationshipStatus } = patientData;
        return first_name && last_name && email && gender && patientID && phone && address && relationshipStatus;
    }

    const checkNextOfKinFilled = () => {
        const { name, phone, relationshipStatus, email } = patientData.nextOfKin;
        return name && phone && email && relationshipStatus;
    };

    const handleNext = () => {
        if (activeTab === 'personal') {
            setIsPersonalFilled(checkPersonalFilled());
            if (isPersonalFilled) setActiveTab('nextOfKin');
        } else if (activeTab === 'nextOfKin') {
            setIsNextOfKinFilled(checkNextOfKinFilled());
            if (isNextOfKinFilled) setActiveTab('profile');
        }
    };

    const handlePrevious = () => {
        if (activeTab === 'nextOfKin') setActiveTab('personal');
        else if (activeTab === 'profile') setActiveTab('nextOfKin');
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setUploadProgress(0);

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'Hospital_management_profile');
        data.append('cloud_name', 'dyc0ssabt');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dyc0ssabt/image/upload', true);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentComplete);
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                const uploadedImageUrl = JSON.parse(xhr.responseText);
                setProfileImage(uploadedImageUrl.url);
                setPatientData((prev) => ({
                    ...prev,
                    avatar: uploadedImageUrl.url
                }));
                setLoading(false);
                setUploadProgress(0);
            } else {
                console.error("Image upload failed: " + xhr.statusText);
                setLoading(false);
            }
        };

        xhr.onerror = () => {
            console.error("Image upload failed: Network error");
            setLoading(false);
        };

        xhr.send(data);
    };

    const handleImageDelete = () => {
        setProfileImage('/Icons/default-image.jpeg');
        setPatientData((prev) => ({
            ...prev,
            avatar: '/Icons/default-image.jpeg'
        }));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await fetch(`/recep-patient/addPatient/${currentUser.hospital_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            })

            const data = await res.json()
            console.log(data)
            if(data.error) {
                console.log("Error: ", data.error)
            }
            else {
                setPatientData(prev => ({
                    ...prev,
                    _id: data.patientData._id
                }));

                setShowVitals(true);
            }
        } catch(error) {
            console.log("Failed to update profile: " + error.message, 'error')
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
                                disabled={false}
                            />
                            <TabButton
                                label="Next of Kin"
                                isActive={activeTab === 'nextOfKin'}
                                onClick={() => setActiveTab('nextOfKin')}
                                disabled={!isPersonalFilled}
                            />
                            <TabButton
                                label="Profile & Fingerprint"
                                isActive={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                                disabled={isNextOfKinFilled}
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
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='patientID' value={patientData.patientID} onChange={handleChange} disabled/>
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
                                </div>
                            )}

                            {activeTab === 'nextOfKin' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='nextOfKin.name' value={patientData.nextOfKin.name} onChange={handleChange}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272] p-2" name='nextOfKin.email' value={patientData.nextOfKin.email} onChange={handleChange}/>
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
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 rounded-md border-dashed">
                                                <div className="space-y-1 text-center">
                                                    <div className='flex flex-col justify-center items-center gap-10'>
                                                        <img 
                                                            src={profileImage} 
                                                            alt={patientData.first_name || "Default Image"} 
                                                            className='w-[100px] h-[100px] object-cover cursor-pointer rounded-full mb-5' 
                                                            onClick={() => fileInputRef.current.click()} 
                                                            title="Click to change or upload image"
                                                        />
                                                        <input 
                                                            type="file" 
                                                            hidden 
                                                            accept='image/*' 
                                                            onChange={handleImageUpload} 
                                                            ref={fileInputRef}
                                                        />
                                                        {(patientData.avatar === "/Icons/default-image.jpeg" || patientData.avatar === '') && (
                                                            <p className='text-black'>Click on the image to upload your profile image</p>
                                                        )}
                                                    </div>
                                                    {(patientData.avatar && patientData.avatar !== "/Icons/default-image.jpeg") && <button onClick={handleImageDelete} className='bg-[#301d1d] text-[#FF0000] border border-[#FF0000] text-[12px] p-1 pl-3 pr-3 rounded-[5px]'>Delete</button>}
                                                    {loading && <div>Uploading: {uploadProgress}%</div>}
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
                        <div className="flex justify-between mt-4">
                            {activeTab !== 'personal' && (
                                <button onClick={handlePrevious} className="bg-gray-300 text-gray-700 py-2 px-4 rounded">
                                    Previous
                                </button>
                            )}
                            {activeTab !== 'profile' ? (
                                <button onClick={handleNext} className="bg-[#00a272] text-white py-2 px-4 rounded">
                                    Next
                                </button>
                            ) : (
                                <button type='submit' onClick={handleSubmit} className="bg-[#00a272] text-white py-2 px-4 rounded">
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showVitals && patientData && (
                <AddVitalsForm 
                    patientData={patientData} 
                    onClose={() => {
                        setShowVitals(false);
                        navigate("/patient");
                    }} 
                />
            )}
        </div>
    );
};

export default AddPatient;
