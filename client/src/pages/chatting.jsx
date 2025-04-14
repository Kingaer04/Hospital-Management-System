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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  
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
      
      // Hide emoji picker if it was open
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
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

  // Add emoji to message
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };
  
  // Common emojis
  const emojis = ['😊', '😂', '👍', '❤️', '🙏', '👋', '🎉', '😍', '🤔', '😢', '😮', '👏', '🔥', '✅', '⭐', '🤝', '🙌', '🫂'];
  
  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
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
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage ? conversation.lastMessage.content : 'Start a conversation'}
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
                        ? <span>Last seen <TimeAgo date={selectedConversation.lastSeen} /></span> 
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          className={`mx-2 max-w-md rounded-2xl px-4 py-2 ${
                          message.sender._id === currentUser._id
                            ? 'bg-[#00A272] text-white'
                            : 'bg-white border border-gray-200'
                          }`}
                        >
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
              <form onSubmit={sendMessage} className="flex items-center">
                {/* Emoji button */}
                <button 
                  type="button"
                  onClick={toggleEmojiPicker}
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-[#00A272] mx-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleTyping}
                />
                
                <button
                  type="submit"
                  className="p-2 bg-[#00A272] text-white rounded-full hover:bg-[#008F64] focus:outline-none focus:ring-2 focus:ring-[#00A272] focus:ring-opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg mt-2 p-2 absolute bottom-16 left-4">
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="text-2xl p-1 hover:bg-gray-100 rounded focus:outline-none"
                        onClick={() => addEmoji(emoji)}
                        type="button"
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
          <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Messages</h3>
            <p className="text-gray-500 text-center max-w-md px-4">
              Select a conversation from the sidebar to start chatting. Your messages are secure and private.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
