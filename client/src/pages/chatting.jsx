import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import TimeAgo from 'react-timeago';
import { useSelector } from 'react-redux';

const ChatInterface = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typing, setTyping] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Connect to socket on component mount
  useEffect(() => {
    // Connect to socket server
    socket.current = io('http://localhost:8000', {
      withCredentials: true,
    });
    
    // Handle connect event
    socket.current.on('connect', () => {
      console.log('Connected to socket server');
      
      // Register user after successful connection
      if (currentUser && currentUser._id) {
        socket.current.emit('register_user', {
          _id: currentUser._id,
          hospital_ID: currentUser.hospitalId
        });
      }
    });
    
    // Handle error event
    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Update the existing socket listener for receive_message
    socket.current.on('receive_message', (data) => {
      if (selectedConversation && selectedConversation._id === data.senderId) {
        // Add the message to the chat
        setMessages(prev => [...prev, data]);
        
        // Send read receipt
        socket.current.emit('mark_read', {
          senderId: data.senderId
        });
      }
      
      // Update conversation list with new message
      updateConversationWithMessage(data);
    });
    
    // Listen for user status changes
    socket.current.on('user_status_change', (data) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: data.status === 'Online'
      }));
      
      // Update the user status in conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.staff._id === data.userId 
            ? {
                ...conv,
                staff: {
                  ...conv.staff,
                  status: data.status,
                  lastSeen: data.lastSeen
                }
              }
            : conv
        )
      );
    });
    
    // Listen for typing events
    socket.current.on('user_typing', (data) => {
      if (selectedConversation && selectedConversation._id === data.senderId) {
        setTyping(prev => ({
          ...prev,
          [data.senderId]: data.typing
        }));
      }
    });
    
    // Listen for read receipts
    socket.current.on('messages_read', (data) => {
      if (selectedConversation && selectedConversation._id === data.receiverId) {
        // Mark all messages to this user as read
        setMessages(prev => 
          prev.map(msg => 
            msg.sender._id === currentUser._id && !msg.read
              ? { ...msg, read: true, readAt: new Date() }
              : msg
          )
        );
      }
    });
    
    // Clean up on unmount
    return () => {
      socket.current.disconnect();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Clean up audio stream if it exists
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentUser, selectedConversation, audioStream]);

  // Add this useEffect to handle audio progress updates
  useEffect(() => {
    if (playingAudio) {
      const audio = document.getElementById(`audio-${playingAudio}`);
      const progressBar = document.getElementById(`progress-${playingAudio}`);
      
      if (!audio || !progressBar) return;
      
      const updateProgress = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
      };
      
      const resetProgress = () => {
        progressBar.style.width = '0%';
        setPlayingAudio(null);
      };
      
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', resetProgress);
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', resetProgress);
      };
    }
  }, [playingAudio]);
  
  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/chat/conversations', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data);
      
      // Initialize online status
      const onlineStatus = {};
      data.forEach(conv => {
        onlineStatus[conv.staff._id] = conv.staff.status === 'Online';
      });
      setOnlineUsers(onlineStatus);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };
  
  // Fetch messages for a conversation
  const fetchMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`http://localhost:8000/api/chat/messages/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages);
      setLoadingMessages(false);
      
      // Update unread count in conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.staff._id === userId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoadingMessages(false);
    }
  };
  
  // Select a conversation
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation.staff);
    fetchMessages(conversation.staff._id);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      markMessagesAsRead(conversation.staff._id);
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async (senderId) => {
    try {
      await fetch(`http://localhost:8000/api/chat/read/${senderId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      // Emit read receipt over socket
      socket.current.emit('mark_read', {
        senderId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Send text message
  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const messageData = {
        receiverId: selectedConversation._id,
        content: newMessage
      };
      
      // Clear input early for better UX
      setNewMessage('');
      
      // Add temporary message to the UI
      const tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        content: newMessage,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        receiver: selectedConversation._id,
        createdAt: new Date(),
        read: false,
        isTemp: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Emit via socket for real-time
      socket.current.emit('send_message', {
        messageId: tempId,
        senderId: currentUser._id,
        receiverId: selectedConversation._id,
        content: newMessage,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      });
      
      // Then send HTTP request to persist in DB
      const response = await fetch('http://localhost:8000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData), 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Replace temporary message with actual message from server
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? sentMessage : msg)
      );
      
      // Update conversation with new message
      updateConversationWithMessage(sentMessage);
      
      // Stop typing indicator
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Improved startRecording function
  const startRecording = async () => {
    try {
      // Request audio permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Save stream reference for cleanup
      setAudioStream(stream);
      
      // Try to use a more widely supported format
      let options;
      
      // Choose the most compatible format for the browser
      if (MediaRecorder.isTypeSupported('audio/mp3')) {
        options = { 
          mimeType: 'audio/mp3',
          audioBitsPerSecond: 128000
        };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = {
          mimeType: 'audio/mp4',
          audioBitsPerSecond: 128000
        };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { 
          mimeType: 'audio/webm',
          audioBitsPerSecond: 128000
        };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { 
          mimeType: 'audio/ogg',
          audioBitsPerSecond: 128000
        };
      } else {
        // Use default settings for the browser
        options = { audioBitsPerSecond: 128000 };
      }
      
      console.log("Using recording options:", options);
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log(`Received audio chunk: ${e.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log(`Recording stopped. Total chunks: ${audioChunksRef.current.length}`);
        
        if (audioChunksRef.current.length === 0) {
          console.error('No audio data recorded');
          alert('No audio was recorded. Please try again.');
          return;
        }
        
        // Create the audio blob with the appropriate MIME type
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('Audio blob created:', 
          `Size: ${audioBlob.size} bytes`, 
          `Type: ${mimeType}`, 
          `Duration: ${recordingTime}s`);
        
        if (audioBlob.size > 0) {
          // Make sure the duration is at least 1 second to avoid empty recordings
          const finalDuration = Math.max(1, recordingTime);
          sendVoiceMessage(audioBlob, finalDuration);
        } else {
          console.error('Empty audio blob created');
          alert('Recording failed. Please try again.');
        }
        
        // Reset recording state
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };
      
      // Start recording with more frequent data collection
      mediaRecorder.start(100); // Request data every 100ms
      setIsRecording(true);
      
      // Start timer for recording duration
      let seconds = 0;
      recordingTimerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Could not access microphone: ' + error.message);
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log("Stopping recording...");
        mediaRecorderRef.current.stop();
        
        // Stop the tracks to release the microphone
        if (audioStream) {
          audioStream.getTracks().forEach(track => {
            console.log(`Stopping audio track: ${track.kind}`);
            track.stop();
          });
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
      
      // Clear the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Improved sendVoiceMessage function
  const sendVoiceMessage = async (audioBlob, duration) => {
    if (!selectedConversation) return;
    
    try {
      // Make sure we have a valid duration
      if (!duration || duration <= 0) {
        console.warn("Invalid duration provided, defaulting to 1 second");
        duration = 1;
      }
      
      // Create a valid file name with proper extension based on the blob type
      const fileExtension = audioBlob.type.includes('webm') ? 'webm' : 
                            audioBlob.type.includes('mp3') ? 'mp3' : 
                            audioBlob.type.includes('mp4') ? 'mp4' : 
                            audioBlob.type.includes('ogg') ? 'ogg' : 'bin';
      
      const fileName = `voice_message_${Date.now()}.${fileExtension}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, fileName);
      formData.append('receiverId', selectedConversation._id);
      formData.append('duration', duration.toString());
      
      // Debug - log FormData entries
      console.log("Voice FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? 
          `Blob (${pair[1].size} bytes, ${pair[1].type})` : pair[1]));
      }
      
      // Create a local URL for the blob to preview before upload completes
      const tempAudioUrl = URL.createObjectURL(audioBlob);
      
      // Test if the audio is playable by creating a test audio element
      const testAudio = new Audio(tempAudioUrl);
      testAudio.volume = 0; // Mute it for testing
      
      // Try to load the audio metadata to verify it's valid
      testAudio.addEventListener('loadedmetadata', () => {
        console.log("Audio preview is valid, duration:", testAudio.duration);
      });
      
      testAudio.addEventListener('error', (e) => {
        console.error("Audio preview test failed:", e);
      });
      
      // Add temporary message with valid audio URL
      const tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        messageType: 'voice',
        audioUrl: tempAudioUrl,
        duration: duration,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        receiver: selectedConversation._id,
        createdAt: new Date(),
        read: false,
        isTemp: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Send HTTP request
      const response = await fetch('http://localhost:8000/api/chat/send-voice', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Failed to send voice message: ${response.status}`);
      }
      
      const sentMessage = await response.json();
      console.log("Voice message sent successfully:", sentMessage);
      
      // Replace temporary message
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? sentMessage : msg)
      );
      
      // Update conversation with new message
      updateConversationWithMessage(sentMessage);
      
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message. Please try again.');
    }
  };

  // Fixed sendFile function
  const sendFile = async (file) => {
    if (!selectedConversation) return;
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', selectedConversation._id);
      
      // Debug - log FormData entries
      console.log("File FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? 
          `${pair[1].name} (${pair[1].size} bytes)` : pair[1]));
      }
      
      // Add temporary message
      const tempId = Date.now().toString();
      const tempFileUrl = URL.createObjectURL(file);
      const tempMessage = {
        _id: tempId,
        messageType: 'file',
        fileUrl: tempFileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        receiver: selectedConversation._id,
        createdAt: new Date(),
        read: false,
        isTemp: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Send HTTP request
      const response = await fetch('http://localhost:8000/api/chat/send-file', {
        method: 'POST',
        body: formData, // Do NOT set Content-Type header, browser will set it with boundary
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Failed to send file: ${response.status}`);
      }
      
      const sentMessage = await response.json();
      
      // Replace temporary message
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? sentMessage : msg)
      );
      
      // Update conversation with new message
      updateConversationWithMessage(sentMessage);
      
    } catch (error) {
      console.error('Error sending file message:', error);
      alert('Failed to send file. Please try again.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      sendFile(file);
    }
  };
  
  // Update conversation list with new message
  const updateConversationWithMessage = (message) => {
    setConversations(prev => {
      const newConversations = [...prev];
      
      // Find the correct conversation
      const senderId = message.sender._id || message.sender;
      const receiverId = message.receiver || message.receiverId;
      
      const targetId = senderId === currentUser._id ? receiverId : senderId;
      
      const conversationIndex = newConversations.findIndex(
        c => c.staff._id === targetId
      );
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        const updatedConversation = { ...newConversations[conversationIndex] };
        updatedConversation.lastMessage = message;
        
        // Update unread count if message is from another user
        if (senderId !== currentUser._id) {
          if (!selectedConversation || selectedConversation._id !== senderId) {
            updatedConversation.unreadCount = (updatedConversation.unreadCount || 0) + 1;
          }
        }
        
        // Remove and add to beginning (most recent)
        newConversations.splice(conversationIndex, 1);
        newConversations.unshift(updatedConversation);
      }
      
      return newConversations;
    });
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedConversation) return;
    
    // Send typing event
    socket.current.emit('typing', {
      receiverId: selectedConversation._id,
      typing: true
    });
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing after 2 seconds
    const timeout = setTimeout(handleStopTyping, 2000);
    setTypingTimeout(timeout);
  };
  
  // Stop typing indicator
  const handleStopTyping = () => {
    if (!selectedConversation) return;
    
    socket.current.emit('typing', {
      receiverId: selectedConversation._id,
      typing: false
    });
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Format time for messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Add emoji to message
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  // Improved getAudioSource function with error handling
  const getAudioSource = (message) => {
    // If it's a temporary message, use the blob URL
    if (message.isTemp && message.audioUrl) {
      return message.audioUrl;
    }
    
    // If it's a server message with audioUrl starting with /uploads/
    if (message.audioUrl && message.audioUrl.startsWith('/uploads/')) {
      return `http://localhost:8000${message.audioUrl}`;
    }
    
    // Add a debug placeholder if the URL is missing
    if (!message.audioUrl) {
      console.error("Missing audio URL for message:", message._id);
      return "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGADq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAH4AAAAAAAZGAB3wAAAAAAAAAAAAAAAAAAAE="
    }
    
    // Return the URL as is
    return message.audioUrl;
  };
  
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-300 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-300 bg-[#00A272] text-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 pl-10 bg-white bg-opacity-20 rounded-full text-white placeholder-white placeholder-opacity-75 focus:outline-none focus:bg-white focus:text-gray-800 focus:placeholder-gray-400"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-24 p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A272]"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.staff._id}
                className={`flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation && selectedConversation._id === conversation.staff._id
                    ? 'bg-[#00A272] bg-opacity-10'
                    : ''
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {conversation.staff.avatar ? (
                      <img
                        src={conversation.staff.avatar}
                        alt={conversation.staff.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-medium text-gray-700">
                        {conversation.staff.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      onlineUsers[conversation.staff._id] ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{conversation.staff.name}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {{formatMessageTime(conversation.lastMessage.createdAt)}
  </span>
)}
  </div>
  <div className="flex justify-between items-center">
<p className="text-sm text-gray-500 truncate">
  {conversation.lastMessage ? (
conversation.lastMessage.messageType === 'voice' ? '🎤 Voice message' :
conversation.lastMessage.messageType === 'file' ? '📎 File' :
conversation.lastMessage.content
  ) : 'Start a conversation'}
</p>
{conversation.unreadCount > 0 && (
  <span className="bg-[#00A272] text-white text-xs rounded-full px-2 py-1 ml-2">
{conversation.unreadCount}
  </span>
)}
  </div>
</div>
  </div>
))
  )}
</div>
  </div>
  
  {/* Chat area */}
  <div className="flex-1 flex flex-col bg-white">
{selectedConversation ? (
  <>
{/* Chat header */}
<div className="px-6 py-3 border-b border-gray-300 flex items-center justify-between">
  <div className="flex items-center">
<div className="relative">
  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
{selectedConversation.avatar ? (
  <img
src={selectedConversation.avatar}
alt={selectedConversation.name}
className="w-full h-full object-cover"
  />
) : (
  <span className="text-lg font-medium text-gray-700">
{selectedConversation.name.charAt(0)}
  </span>
)}
  </div>
  <span
className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
  onlineUsers[selectedConversation._id] ? 'bg-green-500' : 'bg-gray-400'
}`}
  ></span>
</div>
<div className="ml-3">
  <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
  <p className="text-xs text-gray-500">
{onlineUsers[selectedConversation._id] 
  ? 'Online' 
  : selectedConversation.lastSeen 
? `Last seen ${<TimeAgo date={selectedConversation.lastSeen} />}` 
: 'Offline'}
  </p>
</div>
  </div>
  <div className="flex items-center">
<button className="p-2 rounded-full hover:bg-gray-100">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
</button>
<button className="p-2 rounded-full hover:bg-gray-100 ml-2">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
</button>
  </div>
</div>

{/* Messages area */}
<div className="flex-1 p-6 overflow-y-auto bg-gray-50">
  {loadingMessages ? (
<div className="flex items-center justify-center h-24">
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A272]"></div>
</div>
  ) : messages.length === 0 ? (
<div className="text-center py-10">
  <div className="bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
</svg>
  </div>
  <p className="text-gray-500">No messages yet. Start the conversation!</p>
</div>
  ) : (
<>
  {messages.map((message, index) => (
<div
  key={message._id}
  className={`flex mb-4 ${
message.sender._id === currentUser._id ? 'justify-end' : 'justify-start'
  }`}
>
  {/* Message bubble */}
  <div className={`flex items-end ${message.sender._id === currentUser._id ? 'flex-row-reverse' : ''}`}>
{/* Avatar (only show for other person's messages or if different sender) */}
{message.sender._id !== currentUser._id && (
  index === 0 || messages[index - 1].sender._id !== message.sender._id ? (
  <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
    {message.sender.avatar ? (
    <img 
      src={message.sender.avatar} 
      alt={message.sender.name} 
      className="w-full h-full object-cover"
    />
    ) : (
    <div className="w-full h-full flex items-center justify-center">
      {message.sender.name.charAt(0)}
    </div>
    )}
  </div>
  ) : <div className="w-8 flex-shrink-0"></div>
)}

{/* Message content */}
<div
  className={`mx-2 max-w-md ${
  message.messageType === 'voice' || message.messageType === 'file'
    ? 'rounded-lg p-3'
    : 'rounded-2xl px-4 py-2'
  } ${
  message.sender._id === currentUser._id
    ? 'bg-[#00A272] text-white'
    : 'bg-white border border-gray-200'
  }`}
>
  {message.messageType === 'voice' ? (
  <div className="flex items-center">
    <button
    onClick={() => setPlayingAudio(playingAudio === message._id ? null : message._id)}
    className={`p-2 rounded-full ${
      message.sender._id === currentUser._id
      ? 'bg-white bg-opacity-30 text-white'
      : 'bg-[#00A272] bg-opacity-10 text-[#00A272]'
    }`}
    >
    {playingAudio === message._id ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    </button>
    
    <div className="ml-2 flex-1">
    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
      <div 
      id={`progress-${message._id}`}
      className="h-full bg-[#00A272]" 
      style={{ width: '0%' }}
      ></div>
    </div>
    <audio 
      id={`audio-${message._id}`} 
      src={getAudioSource(message)} 
      className="hidden"
    />
    <div className="flex justify-between items-center mt-1">
      <span className={`text-xs ${
      message.sender._id === currentUser._id ? 'text-white text-opacity-80' : 'text-gray-500'
      }`}>
      {message.duration ? `${message.duration}s` : '0:00'}
      </span>
      <span className={`text-xs ${
      message.sender._id === currentUser._id ? 'text-white text-opacity-80' : 'text-gray-500'
      }`}>
      {formatMessageTime(message.createdAt)}
      </span>
    </div>
    </div>
  </div>
  ) : message.messageType === 'file' ? (
  <div>
    <div className={`border rounded p-2 ${
    message.sender._id === currentUser._id ? 'border-white border-opacity-30' : 'border-gray-200'
    }`}>
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
      message.sender._id === currentUser._id ? 'text-white' : 'text-[#00A272]'
      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div className="ml-2">
      <a 
        href={message.fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`font-medium text-sm ${
        message.sender._id === currentUser._id ? 'text-white' : 'text-[#00A272]'
        } underline`}
      >
        {message.fileName}
      </a>
      <p className={`text-xs ${
        message.sender._id === currentUser._id ? 'text-white text-opacity-80' : 'text-gray-500'
      }`}>
        {message.fileSize && formatFileSize(message.fileSize)}
      </p>
      </div>
    </div>
    </div>
    <div className="flex justify-end mt-1">
    <span className={`text-xs ${
      message.sender._id === currentUser._id ? 'text-white text-opacity-80' : 'text-gray-500'
    }`}>
      {formatMessageTime(message.createdAt)}
    </span>
    </div>
  </div>
  ) : (
  <>
    <p className={`whitespace-pre-wrap break-words ${
    message.sender._id === currentUser._id ? 'text-white' : 'text-gray-800'
    }`}>
    {message.content}
    </p>
    <div className="flex justify-end items-center mt-1">
    <span className={`text-xs ${
      message.sender._id === currentUser._id ? 'text-white text-opacity-80' : 'text-gray-500'
    }`}>
      {formatMessageTime(message.createdAt)}
    </span>
    {message.sender._id === currentUser._id && (
      <span className="ml-1">
      {message.read ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white text-opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )}
      </span>
    )}
    </div>
  </>
  )}
</div>
  </div>
</div>
  ))}
  
  {/* Typing indicator */}
  {typing[selectedConversation._id] && (
<div className="flex mb-4 justify-start">
  <div className="flex items-end">
<div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
  {selectedConversation.avatar ? (
  <img 
    src={selectedConversation.avatar} 
    alt={selectedConversation.name} 
    className="w-full h-full object-cover"
  />
  ) : (
  <div className="w-full h-full flex items-center justify-center">
    {selectedConversation.name.charAt(0)}
  </div>
  )}
</div>
<div className="mx-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl">
  <div className="flex space-x-1">
  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
  </div>
</div>
  </div>
</div>
  )}
  
  <div ref={messagesEndRef} />
</>
  )}
</div>

{/* Input area */}
<div className="p-4 border-t border-gray-300">
  {isRecording ? (
<div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
  <div className="flex items-center">
<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
<span className="text-gray-700">Recording... {formatRecordingTime(recordingTime)}</span>
  </div>
  <button 
onClick={stopRecording}
className="bg-[#00A272] text-white rounded-full p-2"
  >
<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
</svg>
  </button>
</div>
  ) : (
<form onSubmit={sendMessage} className="flex items-center">
  <button 
type="button"
onClick={triggerFileUpload}
className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
  >
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
</svg>
  </button>
  <input 
type="file" 
ref={fileInputRef} 
onChange={handleFileChange} 
className="hidden" 
  />
  
  <input
type="text"
placeholder="Type a message"
className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-[#00A272] mx-2"
value={newMessage}
onChange={(e) => setNewMessage(e.target.value)}
onKeyDown={handleTyping}
  />
  
  <button
type="button"
onClick={toggleRecording}
className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
  >
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
</svg>
  </button>
  
  <button
type="submit"
className="p-2 bg-[#00A272] text-white rounded-full hover:bg-[#008F64] focus:outline-none focus:ring-2 focus:ring-[#00A272] focus:ring-opacity-50"
  >
<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
</svg>
  </button>
</form>
  )}
</div>
  </>
) : (
  <div className="flex flex-col items-center justify-center h-full bg-gray-50">
<div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center mb-6">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
</div>
<h3 className="text-xl font-medium text-gray-700 mb-2">Welcome to the Chat</h3>
<p className="text-gray-500 max-w-md text-center">
  Select a conversation from the sidebar to start chatting
</p>
  </div>
)}
  </div>
</div>
  );
};

export default ChatInterface;
