import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Copyright } from 'lucide-react';
import axios from 'axios';

const ChatList = ({ setCurrentUser, socket, myNumber }) => {
  const [chats, setChats] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [showMessage, setMessage] = useState(null);

  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const fetchChatList = async () => {
    console.log("Fetching chat list...");
    try {
      const response = await axios.get('https://chat-app-backend-weld-two.vercel.app/api/get-contact', {
        withCredentials: true,
      });
      setChats(response.data || []);
      console.log("Chat list fetched:", response.data);
    } catch (err) {
      console.error('Failed to fetch chat list', err);
      setChats([]);
    }
  };

  const handleAddUser = () => {
    if (!searchValue || searchValue.length < 10) {
      setError('Please enter a valid phone number');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsLoading(true);
    if (socket) {
      console.log("Emitting addContact event to server...");
      socket.emit('addContact', { ownerNumber: myNumber, contactNumber: searchValue.replace(/\D/g, '') });
      setSearchValue('');
    } else {
      console.error("Socket connection is not established.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatList();

    if (socket) {
      console.log("Socket is connected with ID:", socket.id);

      const handleAddContactResponse = (data) => {
        console.log("Received addContactResponse from server:", data);
        setIsLoading(false);
        if (data.status === 'success') {
          setMessage(data.message);
          setTimeout(() => setMessage(null), 3000);
          fetchChatList();
        } else {
          setError(data.message || 'Failed to add user');
          setShowError(true);
          setTimeout(() => setShowError(false), 3000);
        }
      };

      const handleUpdatedContactList = (updatedChats) => {
        console.log("Received updated contact list from server:", updatedChats);
        setChats(updatedChats);
      };

      socket.on('addContactResponse', handleAddContactResponse);
      socket.on('updatedContactList', handleUpdatedContactList);

      return () => {
        socket.off('addContactResponse', handleAddContactResponse);
        socket.off('updatedContactList', handleUpdatedContactList);
      };
    } else {
      console.warn("Socket is not initialized yet.");
    }
  }, [socket]);

  return (
    <div className="w-full max-w-md border-r border-gray-200 h-screen bg-white dark:bg-gray-800 dark:text-white shadow-sm flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-green-50 dark:bg-green-900/20 transition-colors duration-300">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter phone number..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-400" />
          </div>
          <button
            onClick={handleAddUser}
            disabled={isLoading}
            className="flex items-center justify-center p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 transform hover:scale-105"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>

        {showError && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm animate-pulse">
            {error}
          </div>
        )}
        {showMessage && (
          <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg text-sm animate-pulse">
            {showMessage}
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/20">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => {
                setCurrentUser(chat.contactNumber)
                socket.emit("updateUnreadMessageCount",{currentUser:chat.contactNumber,myNumber})
              }}
              className="flex items-center p-4 border-b border-gray-100 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                <span className="text-green-600 dark:text-green-400 text-lg font-semibold group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  {chat.contactNumber.slice(-2)}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                    {formatPhoneNumber(chat.contactNumber)}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
              {chat.unreadMessageCount > 0 && (
                <div className="ml-2 bg-green-500 dark:bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-green-600 dark:group-hover:bg-green-700 transition-colors duration-300">
                  {chat.unreadMessageCount}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No chats available</p>
        )}
      </div>

      {/* Copyright Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        <Copyright className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-green-600 dark:text-green-400">
          2024 Developed by Mayank. All rights reserved.
        </span>
      </div>
    </div>
  );
};

export default ChatList;