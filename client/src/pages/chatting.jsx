// src/components/Chat/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Paperclip, Mic, MicOff, Image, Smile, MoreVertical, Phone, Video, ChevronLeft, Circle, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useSelector } from 'react-redux';

const ChatInterface = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;
    
    const newSocket = io(API_URL);
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, API_URL]);
  
  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentUser) return;
    
    // Connect and set online status
    socket.emit('userOnline', { userId: currentUser._id });
    
    // Listen for online users
    socket.on('onlineUsers', (users) => {
      const usersMap = {};
      users.forEach(user => {
        usersMap[user.userId] = user.status;
      });
      setOnlineUsers(usersMap);
    });
    
    // Listen for user status changes
    socket.on('userStatus', ({ userId, status }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [userId]: status
      }));
    });
    
    // Listen for new messages
    socket.on('newMessage', (message) => {
      // Add message to the current conversation if it's active
      if (activeConversation && 
          ((message.sender._id === activeConversation._id && message.receiver?._id === currentUser._id) || 
           (message.receiver?._id === activeConversation._id && message.sender._id === currentUser._id))) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read immediately if this is the active conversation
        socket.emit('markAsRead', {
          messageIds: [message._id],
          senderId: message.sender._id,
          receiverId: currentUser._id
        });
      }
      
      // Update conversations list with new message
      updateConversationsWithNewMessage(message);
    });
    
    // Listen for typing indicators
    socket.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));
    });
    
    // Listen for read receipts
    socket.on('messagesRead', ({ messageIds, readBy }) => {
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) ? { ...msg, readAt: new Date() } : msg
        )
      );
    });
    
    return () => {
      socket.off('onlineUsers');
      socket.off('userStatus');
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messagesRead');
    };
  }, [socket, currentUser, activeConversation, API_URL]);
  
  // Fetch conversations on load
  useEffect(() => {
    if (!currentUser) return;
    
    fetchConversations();
  }, [currentUser]);
  
  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    
    fetchMessages();
  }, [activeConversation, currentUser]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch user conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messages/user/${currentUser._id}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };
  
  // Fetch messages for active conversation
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messages/conversation`, {
        params: {
          userId: currentUser._id,
          receiverId: activeConversation._id
        }
      });
      
      setMessages(response.data);
      
      // Mark received messages as read
      const unreadMessages = response.data.filter(
        msg => msg.sender._id === activeConversation._id && !msg.readAt
      );
      
      if (unreadMessages.length > 0 && socket) {
        socket.emit('markAsRead', {
          messageIds: unreadMessages.map(msg => msg._id),
          senderId: activeConversation._id,
          receiverId: currentUser._id
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  // Update conversations list with new message
  const updateConversationsWithNewMessage = (message) => {
    setConversations(prevConversations => {
      // Determine the conversation partner
      const partnerId = message.sender._id === currentUser._id 
        ? message.receiver?._id 
        : message.sender._id;
      
      // Find if conversation already exists
      const existingConvIndex = prevConversations.findIndex(
        conv => conv._id === partnerId
      );
      
      if (existingConvIndex > -1) {
        // Update existing conversation
        const updatedConversations = [...prevConversations];
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessage: message,
          unreadCount: message.sender._id !== currentUser._id && 
                      activeConversation?._id !== partnerId
            ? updatedConversations[existingConvIndex].unreadCount + 1
            : updatedConversations[existingConvIndex].unreadCount
        };
        
        // Move this conversation to the top
        const [conv] = updatedConversations.splice(existingConvIndex, 1);
        return [conv, ...updatedConversations];
      } else if (partnerId) {
        // Create new conversation
        const partner = message.sender._id === currentUser._id 
          ? message.receiver 
          : message.sender;
          
        const newConversation = {
          _id: partnerId,
          lastMessage: message,
          unreadCount: message.sender._id !== currentUser._id ? 1 : 0,
          conversationWith: partner
        };
        
        return [newConversation, ...prevConversations];
      }
      
      return prevConversations;
    });
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() && !recordedChunksRef.current.length) return;
    
    if (socket && activeConversation) {
      const messageData = {
        sender: currentUser._id,
        receiver: activeConversation._id,
        text: newMessage.trim(),
        messageType: 'text'
      };
      
      socket.emit('sendMessage', messageData);
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing', {
        senderId: currentUser._id,
        receiverId: activeConversation._id,
        isTyping: false
      });
    }
  };
  
  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !activeConversation) return;
    
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      socket.emit('typing', {
        senderId: currentUser._id,
        receiverId: activeConversation._id,
        isTyping: true
      });
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
      socket.emit('typing', {
        senderId: currentUser._id,
        receiverId: activeConversation._id,
        isTyping: false
      });
    }
  };
  
  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation.conversationWith);
    setIsMobileViewOpen(true);
    
    // If there are unread messages, mark them as read
    if (conversation.unreadCount > 0) {
      // Update UI immediately
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === conversation._id 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    }
  };
  
  // Handle file upload
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket || !activeConversation) return;
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Send message with file attachment
      const messageData = {
        sender: currentUser._id,
        receiver: activeConversation._id,
        mediaUrl: response.data.url,
        messageType: file.type.startsWith('image/') ? 'image' : 'document'
      };
      
      socket.emit('sendMessage', messageData);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };
  
  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.addEventListener("stop", () => {
        sendVoiceMessage();
        
        // Stop the tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const sendVoiceMessage = async () => {
    if (!recordedChunksRef.current.length || !socket || !activeConversation) return;
    
    try {
      setIsUploading(true);
      
      const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      recordedChunksRef.current = [];
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');
      

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Send message with voice attachment
      const messageData = {
        sender: currentUser._id,
        receiver: activeConversation._id,
        mediaUrl: response.data.url,
        messageType: 'voice'
      };
      
      socket.emit('sendMessage', messageData);
      setIsUploading(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      setIsUploading(false);
    }
  };
  
  // Render message item
  const renderMessage = (message) => {
    const isOwnMessage = message.sender._id === currentUser._id;
    
    return (
      <div 
        key={message._id} 
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isOwnMessage && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
              {message.sender.name.charAt(0)}
            </div>
          </div>
        )}
        
        <div 
          className={`max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${
            isOwnMessage 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {message.messageType === 'text' && (
            <p className="break-words">{message.text}</p>
          )}
          
          {message.messageType === 'image' && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={message.mediaUrl} 
                alt="Image" 
                className="max-w-full rounded-lg"
                loading="lazy"
              />
            </div>
          )}
          
          {message.messageType === 'voice' && (
    <div className="my-1">
      <audio ref={audioRef} src={message.mediaUrl} controls className="max-w-full" />
    </div>
  )}
  
  {message.messageType === 'document' && (
    <div className="flex items-center">
      <a 
        href={message.mediaUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-200 hover:underline flex items-center"
      >
        <Paperclip className="mr-2 h-4 w-4" />
        <span>Document</span>
      </a>
    </div>
  )}
  
  <div className="text-xs mt-1 opacity-70 flex justify-end">
    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    {isOwnMessage && (
      <span className="ml-2">
        {message.readAt ? (
          <CheckCircle2 className="h-3 w-3 text-blue-200" />
        ) : message.deliveredAt ? (
          <CheckCircle className="h-3 w-3 text-blue-200" />
        ) : (
          <Circle className="h-3 w-3 text-blue-200" />
        )}
      </span>
    )}
  </div>
</div>

{isOwnMessage && (
  <div className="flex-shrink-0 ml-3">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
      {currentUser.name.charAt(0)}
    </div>
  </div>
)}
  </div>
);
  };
  
  // Filters conversations based on search term
  const filteredConversations = conversations.filter(conv => 
conv.conversationWith?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
<div className="flex h-screen bg-gray-50">
  {/* Sidebar - Conversations List */}
  <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r ${isMobileViewOpen ? 'hidden md:block' : 'block'}`}>
<div className="p-4 border-b">
  <h2 className="text-xl font-semibold">Messages</h2>
  <div className="mt-2">
    <input 
      type="text"
      placeholder="Search conversations..."
      className="w-full p-2 border rounded-lg"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>

<div className="overflow-y-auto h-[calc(100vh-120px)]">
  {filteredConversations.map(conversation => (
    <div 
      key={conversation._id}
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
        activeConversation?._id === conversation.conversationWith._id ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleSelectConversation(conversation)}
    >
      <div className="flex items-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
            {conversation.conversationWith?.name?.charAt(0)}
          </div>
          {onlineUsers[conversation._id] === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{conversation.conversationWith?.name}</h3>
            <span className="text-xs text-gray-500">
              {conversation.lastMessage?.createdAt && 
               new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 truncate w-32">
              {conversation.lastMessage?.text || 
               (conversation.lastMessage?.messageType === 'image' && '📷 Image') ||
               (conversation.lastMessage?.messageType === 'voice' && '🎤 Voice message') ||
               (conversation.lastMessage?.messageType === 'document' && '📄 Document')}
            </p>
            
            {conversation.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
  </div>
  
  {/* Main Chat Area */}
  <div className={`w-full md:w-2/3 lg:w-3/4 flex flex-col ${!isMobileViewOpen ? 'hidden md:flex' : 'flex'}`}>
{activeConversation ? (
  <>
    {/* Chat Header */}
    <div className="p-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center">
        <button 
          className="md:hidden mr-2 text-gray-500"
          onClick={() => setIsMobileViewOpen(false)}
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
            {activeConversation.name.charAt(0)}
          </div>
          {onlineUsers[activeConversation._id] === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="ml-3">
          <h3 className="font-semibold">{activeConversation.name}</h3>
          <p className="text-xs text-gray-500">
            {onlineUsers[activeConversation._id] === 'online' 
              ? 'Online' 
              : 'Offline'}
            {typingUsers[activeConversation._id] && ' • typing...'}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
          <Phone size={20} />
        </button>
        <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
          <Video size={20} />
        </button>
        <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
    
    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map(message => renderMessage(message))}
      
      {typingUsers[activeConversation._id] && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
    
    {/* Message Input */}
    <div className="p-4 bg-white border-t">
      <div className="flex items-center">
        <button 
          className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
          onClick={handleFileSelect}
        >
          <Paperclip size={20} />
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
        </button>
        
        <button 
          className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={20} />
        </button>
        
        <div className="flex-1 mx-2">
          <input 
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 border rounded-full"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
        </div>
        
        {isRecording ? (
          <button 
            className="p-2 text-red-600 rounded-full hover:bg-gray-100"
            onClick={stopRecording}
          >
            <MicOff size={20} />
          </button>
        ) : (
          <button 
            className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
            onClick={startRecording}
          >
            <Mic size={20} />
          </button>
        )}
        
        <button 
          className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handleSendMessage}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      
      {showEmojiPicker && (
        <div className="mt-2 bg-white border rounded-lg shadow-lg p-2">
          {/* Emoji picker would go here */}
          <div className="grid grid-cols-8 gap-1">
            {['😊', '😂', '❤️', '👍', '🙏', '🔥', '🎉', '😍'].map((emoji, index) => (
              <button 
                key={index}
                className="p-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setNewMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </>
) : (
  <div className="flex-1 flex items-center justify-center bg-gray-50">
    <div className="text-center p-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Send size={24} className="text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
      <p className="text-gray-500">Select a conversation to start messaging</p>
    </div>
  </div>
)}
  </div>
</div>
  );
};

export default ChatInterface;
