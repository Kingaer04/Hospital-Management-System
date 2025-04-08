import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import TimeAgo from 'react-timeago';
import {useSelector} from 'react-redux'

const ChatInterface = () => {
  const {currentUser} = useSelector((state) => state.user)
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typing, setTyping] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  
  // Connect to socket on component mount
  useEffect(() => {
    // Connect to socket server
    socket.current = io('http://localhost:8000');
    
    // Handle connect event
    socket.current.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    // Handle error event
    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Listen for incoming messages
    socket.current.on('receive_message', (data) => {
      if (selectedConversation && selectedConversation._id === data.senderId) {
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
    socket.current.on('messages_read', () => {
      if (selectedConversation) {
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
  }, [selectedConversation, currentUser._id]);
  
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
      const response = await fetch(`http://localhost:8000/api/chat/messages/${userId}`);
      
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
        method: 'PUT'
      });
      
      // Emit read receipt over socket
      socket.current.emit('mark_read', {
        senderId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedConversation._id,
          content: newMessage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Add to messages list
      setMessages(prev => [...prev, sentMessage]);
      
      // Update conversation with new message
      updateConversationWithMessage(sentMessage);
      
      // Clear input
      setNewMessage('');
      
      // Emit via socket
      socket.current.emit('send_message', {
        messageId: sentMessage._id,
        senderId: currentUser._id,
        receiverId: selectedConversation._id,
        content: sentMessage.content,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      });
      
      // Stop typing indicator
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Update conversation list with new message
  const updateConversationWithMessage = (message) => {
    setConversations(prev => {
      const newConversations = [...prev];
      const conversationIndex = newConversations.findIndex(
        c => c.staff._id === (message.sender._id === currentUser._id ? message.receiver : message.sender._id)
      );
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        const updatedConversation = { ...newConversations[conversationIndex] };
        updatedConversation.lastMessage = message;
        
        // Update unread count if message is from another user
        if (message.sender._id !== currentUser._id) {
          if (!selectedConversation || selectedConversation._id !== message.sender._id) {
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
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300 bg-blue-600 text-white">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <p className="text-sm">Chat with hospital staff</p>
        </div>
        
        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="loader">Loading...</div>
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
                    ? 'bg-blue-50'
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
                      {conversation.lastMessage
                        ? conversation.lastMessage.content
                        : `${conversation.staff.role} • Start chatting`}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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
                <div className="flex items-center justify-center h-full">
                  <div className="loader">Loading messages...</div>
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
                          <div 
                            className={`p-3 rounded-lg ${
                              isMine 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                            }`}
                          >
                            {message.content}
                          </div>
                          <div 
                            className={`flex items-center text-xs mt-1 ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span className="text-gray-500">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isMine && (
                              <span className="ml-1">
                                {message.read ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                                alt={scurrentUer.name}
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
                    <div className="flex items-center">
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
                      <div className="bg-white p-3 rounded-lg rounded-bl-none border border-gray-200 inline-block">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-3 bg-white border-t border-gray-300">
              <form onSubmit={sendMessage} className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={() => handleTyping()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="ml-2 bg-blue-600 text-white rounded-full p-2 focus:outline-none hover:bg-blue-700 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Your messages</h3>
            <p className="text-sm mb-6">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
