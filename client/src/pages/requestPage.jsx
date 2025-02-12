import React, { useState, useEffect, useRef } from 'react';

const RequestPage = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [fingerprint, setFingerprint] = useState(null);
    const [scannerError, setScannerError] = useState(null);
    const [quality, setQuality] = useState('');
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const testRef = useRef(null);

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
                
                // Calculate contrast
                let min = 255;
                let max = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    if (gray < min) min = gray;
                    if (gray > max) max = gray;
                }
                const contrast = (max - min) / 255;
                
                // Calculate average brightness
                let totalBrightness = 0;
                for (let i = 0; i < data.length; i += 4) {
                    totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
                }
                const avgBrightness = totalBrightness / (data.length / 4);
                
                // Calculate ridge clarity (using edge detection)
                let edges = 0;
                for (let y = 1; y < canvas.height - 1; y++) {
                    for (let x = 1; x < canvas.width - 1; x++) {
                        const idx = (y * canvas.width + x) * 4;
                        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
                        const bottom = (data[idx + canvas.width * 4] + data[idx + canvas.width * 4 + 1] + data[idx + canvas.width * 4 + 2]) / 3;
                        
                        if (Math.abs(current - right) > 20 || Math.abs(current - bottom) > 20) {
                            edges++;
                        }
                    }
                }
                const ridgeClarity = edges / (canvas.width * canvas.height);
                
                // Adjusted quality score calculation based on ridge clarity
                // Since 30% ridge clarity is considered good, we'll adjust our scale accordingly
                const normalizedRidgeClarity = (ridgeClarity * 100);
                let qualityScore;
                let qualityLabel;

                // Adjusted thresholds based on 30% being good
                if (normalizedRidgeClarity >= 35) {
                    qualityScore = 95; // Excellent
                    qualityLabel = 'Excellent';
                } else if (normalizedRidgeClarity >= 25) {
                    qualityScore = 85; // Very Good
                    qualityLabel = 'Very Good';
                } else if (normalizedRidgeClarity >= 15) {
                    qualityScore = 70; // Good
                    qualityLabel = 'Good';
                } else if (normalizedRidgeClarity >= 10) {
                    qualityScore = 50; // Fair
                    qualityLabel = 'Fair';
                } else {
                    qualityScore = 30; // Poor
                    qualityLabel = 'Poor';
                }
                
                resolve({
                    score: Math.round(qualityScore),
                    label: qualityLabel,
                    details: {
                        contrast: Math.round(contrast * 100),
                        brightness: Math.round(avgBrightness),
                        ridgeClarity: Math.round(ridgeClarity * 100)
                    }
                });
            };
            img.src = imageData;
        });
    };

    const FingerprintSdkTest = function () {
        this.sdk = new Fingerprint.WebApi();

        this.sdk.onSamplesAcquired = async (s) => {
            console.log("Samples acquired:", s);
            if (s && s.samples) {
                try {
                    const samples = JSON.parse(s.samples);
                    const base64Image = "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]);
                    setFingerprint(base64Image);
                    
                    // Assess quality
                    const qualityResults = await assessImageQuality(base64Image);
                    setQuality(`${qualityResults.label} (${qualityResults.score}%) - Contrast: ${qualityResults.details.contrast}%, Ridge Clarity: ${qualityResults.details.ridgeClarity}%`);
                    
                    if (qualityResults.score < 50) {
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

        // Rest of the code remains the same...
        this.startCapture = function () {
            this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(() => {
                console.log("You can start capturing !!!");
                setAcquisitionStarted(true);
            }).catch((error) => {
                console.error("Error starting capture:", error.message);
                setScannerError(error.message);
            });
        };

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

    // Rest of the component implementation remains exactly the same...
    useEffect(() => {
        testRef.current = new FingerprintSdkTest();
    }, []);

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
            testRef.current.startCapture();
        } else {
            console.error('Fingerprint SDK instance is not initialized.');
        }
    };

    const handleStopCapture = () => {
        if (testRef.current) {
            testRef.current.stopCapture();
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
                            {quality && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Quality Assessment: {quality}
                                </p>
                            )}
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
                </div>
            </div>
        </div>
    );
};

export default RequestPage;