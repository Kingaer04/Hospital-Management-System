import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setAudioBlob(null);
      setAudioUrl('');
      setRecordingTime(0);
    }
  };
  
  const sendRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime);
      // Reset state
      setAudioBlob(null);
      setAudioUrl('');
      setRecordingTime(0);
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="voice-recorder p-2 bg-gray-100 rounded-lg">
      {!audioBlob ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isRecording ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              </>
            ) : (
              <span className="text-sm font-medium">Ready to record</span>
            )}
          </div>
          
          <div className="flex">
            {isRecording ? (
              <>
                <button 
                  onClick={cancelRecording}
                  className="text-red-500 mr-2 p-1 rounded-full hover:bg-red-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button 
                  onClick={stopRecording}
                  className="text-green-500 p-1 rounded-full hover:bg-green-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </>
            ) : (
              <button 
                onClick={startRecording}
                className="text-green-700 p-1 rounded-full hover:bg-green-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <audio controls src={audioUrl} className="h-10 w-32"></audio>
            <span className="text-xs ml-2">{formatTime(recordingTime)}</span>
          </div>
          
          <div className="flex">
            <button 
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl('');
                setRecordingTime(0);
              }}
              className="text-red-500 mr-2 p-1 rounded-full hover:bg-red-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button 
              onClick={sendRecording}
              className="text-green-700 p-1 rounded-full hover:bg-green-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
