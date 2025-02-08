{/*

1. 
import React, { useState } from 'react';
import { OpenCvProvider, useOpenCv } from 'opencv-react';

// Wrapper component that provides OpenCV context
const FingerPrintVerification = () => {
  return (
    <OpenCvProvider>
      <FingerPrintMatcher />
    </OpenCvProvider>
  );
};

// Main component that uses OpenCV
const FingerPrintMatcher = () => {
  const { loaded, cv } = useOpenCv();
  const [template, setTemplate] = useState(null);
  const [sample, setSample] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const preprocessImage = async (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const mat = cv.matFromImageData(imgData);
        
        const gray = new cv.Mat();
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
        
        const thresh = new cv.Mat();
        cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        
        mat.delete();
        gray.delete();
        
        resolve(thresh);
      };
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleImageUpload = async (imageFile, type) => {
    try {
      const processedImage = await preprocessImage(imageFile);
      if (type === 'template') {
        if (template) template.delete();
        setTemplate(processedImage);
      } else {
        if (sample) sample.delete();
        setSample(processedImage);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const matchFingerprints = () => {
    if (!template || !sample) return;
  
    try {
      const orb = new cv.ORB();
      
      const kp1 = new cv.KeyPointVector();
      const kp2 = new cv.KeyPointVector();
      const desc1 = new cv.Mat();
      const desc2 = new cv.Mat();
      
      orb.detectAndCompute(template, new cv.Mat(), kp1, desc1);
      orb.detectAndCompute(sample, new cv.Mat(), kp2, desc2);
  
      // Check if descriptors are empty
      if (desc1.empty() || desc2.empty()) {
        console.error('One of the descriptors is empty');
        return;
      }
  
      const matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);
      const matches = new cv.DMatchVector(); // Create an output vector for matches
      
      // Use the correct number of arguments for the match function
      matcher.match(desc1, desc2, matches);
  
      const numGoodMatches = matches.size();
      const score = (numGoodMatches / Math.min(kp1.size(), kp2.size())) * 100;
      
      setMatchResult({
        score: score.toFixed(2),
        matches: numGoodMatches
      });
  
      desc1.delete();
      desc2.delete();
      kp1.delete();
      kp2.delete();
      orb.delete();
      matches.delete(); // Cleanup matches vector
  
    } catch (error) {
      console.error('Error matching fingerprints:', error);
      setMatchResult({ error: 'Error matching fingerprints: ' + error.message });
    }
  };

  if (!loaded) {
    return (
      <div className="w-full max-w-xl p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p>Loading OpenCV.js...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl p-6 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-bold">Fingerprint Matcher</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Upload Template Fingerprint</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0], 'template')}
            className="mt-2 mb-4"
          />
        </div>
        
        <div>
          <label className="block mb-2">Upload Sample Fingerprint</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0], 'sample')}
            className="mt-2 mb-4"
          />
        </div>

        <button
          onClick={matchFingerprints}
          disabled={!template || !sample}
          className="w-full bg-blue-500 text-white rounded px-4 py-2"
        >
          Compare Fingerprints
        </button>

        {matchResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Match Results:</h3>
            {matchResult.error ? (
              <p className="text-red-500">{matchResult.error}</p>
            ) : (
              <>
                <p>Match Score: {matchResult.score}%</p>
                <p>Number of Matching Points: {matchResult.matches}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FingerPrintVerification; 

2.


*/}