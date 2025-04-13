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
    };
  }, [currentUser, selectedConversation]);
  
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
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
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

  // Fix for sendVoiceMessage function
// Fixed sendVoiceMessage function
const sendVoiceMessage = async (audioBlob, duration) => {
  if (!selectedConversation) return;
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_message.webm');
    formData.append('receiverId', selectedConversation._id);
    formData.append('duration', duration.toString());
    
    // Debug - log FormData entries
    console.log("Voice FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? 
        `Blob (${pair[1].size} bytes)` : pair[1]));
    }
    
    // Add temporary message
    const tempId = Date.now().toString();
    const tempAudioUrl = URL.createObjectURL(audioBlob);
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
      body: formData, // Do NOT set Content-Type header, browser will set it with boundary
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', response.status, errorText);
      throw new Error(`Failed to send voice message: ${response.status}`);
    }
    
    const sentMessage = await response.json();
    
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

// Improved startRecording function to ensure proper audio blob creation
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Use a widely supported audio format
    const options = { mimeType: 'audio/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      if (audioChunksRef.current.length === 0) {
        console.error('No audio data recorded');
        alert('No audio was recorded. Please try again.');
        return;
      }
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('Audio blob created:', audioBlob.size, 'bytes');
      
      if (audioBlob.size > 0) {
        sendVoiceMessage(audioBlob, recordingTime);
      } else {
        console.error('Empty audio blob created');
        alert('Recording failed. Please try again.');
      }
      
      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
    };
    
    // Request data at regular intervals (e.g., every 200ms)
    mediaRecorder.start(200);
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
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate max-w-[180px]">
                      {conversation.lastMessage?.content || `${conversation.staff.role} • Start chatting`}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-[#00A272] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {conversation.staff.role}
                    {!onlineUsers[conversation.staff._id] && conversation.staff.lastSeen && (
                      <span className="ml-1">
                        • Last seen <TimeAgo date={conversation.staff.lastSeen} />
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
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-300 bg-white flex items-center">
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
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${
                    onlineUsers[selectedConversation._id] ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></span>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.role} • 
                  {onlineUsers[selectedConversation._id] 
                    ? ' Online' 
                    : selectedConversation.lastSeen 
                      ? ` Last seen ${formatMessageTime(selectedConversation.lastSeen)}` 
                      : ' Offline'
                  }
                </p>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-24 p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A272]"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Start a conversation with {selectedConversation.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isMine = message.sender._id === currentUser._id;
                    const showAvatar = 
                      index === 0 || 
                      messages[index - 1].sender._id !== message.sender._id;
                    
                    return (
                      <div 
                        key={message._id} 
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMine && showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden mr-2">
                            {message.sender.avatar ? (
                              <img
                                src={message.sender.avatar}
                                alt={message.sender.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-700">
                                {message.sender.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="max-w-[70%]">
                          {message.messageType === 'voice' ? (
                            <div 
                              className={`p-3 rounded-lg ${
                                isMine 
                                  ? 'bg-[#00A272] text-white rounded-br-none' 
                                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center">
                                <button className="mr-2 text-current">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                                <div className="flex-1">
                                  <div className="h-1.5 bg-gray-300 rounded-full">
                                    <div className="h-1.5 bg-blue-500 rounded-full w-1/3"></div>
                                  </div>
                                </div>
                                <span className="ml-2 text-xs">
                                  {formatRecordingTime(message.duration)}
                                </span>
                              </div>
                            </div>
                          ) : message.messageType === 'file' ? (
                            <div 
                              className={`p-3 rounded-lg ${
                                isMine 
                                  ? 'bg-[#00A272] text-white rounded-br-none' 
                                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  <div className="font-medium">{message.fileName}</div>
                                  <div className="text-xs">{formatFileSize(message.fileSize)}</div>
                                </div>
                                <a 
                                  href={message.fileUrl} 
                                  download={message.fileName}
                                  className={`ml-2 text-xs ${isMine ? 'text-white' : 'text-blue-500'}`}
                                >
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={`p-3 rounded-lg ${
                                isMine 
                                  ? 'bg-[#00A272] text-white rounded-br-none' 
                                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                              }`}
                            >
                              <p>{message.content}</p>
                            </div>
                          )}
                          <div 
                            className={`mt-1 text-xs text-gray-500 flex items-center ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                            {isMine && (
                              <span className="ml-1">
                                {message.read ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                ) : message.isTemp ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        {isMine && showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden ml-2">
                            {currentUser.avatar ? (
                              <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-700">
                                {currentUser.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Typing indicator */}
                  {typing[selectedConversation._id] && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden mr-2">
                        {selectedConversation.avatar ? (
                          <img
                            src={selectedConversation.avatar}
                            alt={selectedConversation.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {selectedConversation.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded-lg rounded-bl-none border border-gray-200">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-3 border-t border-gray-300 bg-white">
              {isRecording ? (
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="font-medium text-red-500">Recording: {formatRecordingTime(recordingTime)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={stopRecording}
                      className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
                    >
                      Stop
                    </button>
                    <button
                      onClick={() => {
                        stopRecording();
                        setIsRecording(false);
                        if (recordingTimerRef.current) {
                          clearInterval(recordingTimerRef.current);
                        }
                      }}
                      className="px-4 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-[#00A272] focus:ring-1 focus:ring-[#00A272]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedFile && !isRecording}
                    className={`p-2 rounded-full focus:outline-none ${
                      newMessage.trim() || selectedFile || isRecording
                        ? 'bg-[#00A272] text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
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
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">Welcome to HealthChat</h2>
            <p className="text-center max-w-md px-4">
              Select a conversation from the sidebar to start messaging or continue an existing chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
