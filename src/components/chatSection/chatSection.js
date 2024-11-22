import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getSocket } from '../../socket';
import { ArrowLeft, Send } from 'lucide-react';

const ChatMessage = ({ currentUserNumber, currentUser, myNumber, onBackToList }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Send new message
  const handleNewMessage = () => {
    if (newMessage.trim() && currentUser) {
      setIsLoading(true);
      const socket = getSocket();
      socket.emit("newMessage", { 
        participant1: myNumber, 
        participant2: currentUser, 
        sender: myNumber, 
        content: newMessage.trim() 
      });
      setNewMessage('');
      setIsLoading(false);
    }
  };

  // Fetch messages when current user changes
  useEffect(() => {
    if (currentUser) {
      const socket = getSocket();
      socketRef.current = socket;

      // Listen for new messages
      const handleUpdatedMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };
      socket.on("updatedMessage", handleUpdatedMessage);

      // Fetch existing messages
      const fetchMessages = async () => {
        try {
          // Retrieve the token from localStorage
          const token = sessionStorage.getItem('token');
        
          // Check if the token exists
          if (!token) {
            throw new Error('No token found, please log in.');
          }
        
          // Send the request with the Authorization header
          const response = await axios.post(
            'https://chat-app-backend-2vt3.onrender.com/api/conversation/getmessage',
            { participant2: currentUser },
            {
              headers: {
                'Authorization': `Bearer ${token}`, // Attach JWT token in the Authorization header
                'Content-Type': 'application/json'  // Set content type for the request
              }
            }
          );
        
          // Set the messages received from the backend
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
        
      };
      fetchMessages();

      // Cleanup socket listeners
      return () => {
        socket.off("updatedMessage", handleUpdatedMessage);
      };
    }
  }, [currentUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle enter key press to send message
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleNewMessage();
    }
  };

  // No user selected view
  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-green-50 dark:bg-gray-800">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-xl">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-green-50 dark:bg-gray-800">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Back Button for Mobile */}
          <button 
            onClick={onBackToList} 
            className="mr-4 md:hidden"
            aria-label="Back to chat list"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentUser}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === myNumber ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender === myNumber 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span 
                className={`text-xs mt-1 block ${
                  message.sender === myNumber 
                    ? 'text-green-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full 
              focus:outline-none focus:border-green-500 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <button 
            onClick={handleNewMessage} 
            disabled={isLoading || !newMessage.trim()}
            className="bg-green-500 text-white p-2 rounded-full 
              hover:bg-green-600 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;