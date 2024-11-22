import React, { useContext, useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatMessage from './chatSection';
import { ContactContext } from '../../Context/ContactContext';
import { connectSocket } from '../../socket';
import axios from 'axios';

const ChatApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useContext(ContactContext);
  const [socket, setSocket] = useState(null);
  const [myNumber, setNumber] = useState("");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [showChatList, setShowChatList] = useState(true);

  // Responsive and socket setup (same as previous implementation)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      
      if (!mobile) {
        setShowChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      try {
        // Retrieve the token from localStorage
        const token = sessionStorage.getItem('token');
        
        // Check if the token exists
        if (!token) {
          throw new Error('No token found, please log in.');
        }
      
        // Make the API request with the Authorization header
        const response = await axios.get(
          `https://chat-app-backend-7z2z.onrender.com/api/profile`,
          {
            headers: {
              'Authorization': `Bearer ${token}`, // Attach the JWT token in the Authorization header
            },
            withCredentials: true // If you still want to include credentials (like cookies) with the request
          }
        );
      
        // Handle the response and connect to the socket
        const newSocket = connectSocket(response.data.phoneNumber);
        setNumber(response.data.phoneNumber);
        setSocket(newSocket);
      } catch (error) {
        console.log("Error fetching profile", error);
      }
      
    }
    getProfile();
  }, []);

  // Handle chat selection
  const handleSelectChat = (userNumber) => {
    setCurrentUser(userNumber);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  // Back to chat list handler
  const handleBackToList = () => {
    setCurrentUser(null);
    setShowChatList(true);
  };

  if (!socket) {
    return <div>Connecting to chat...</div>;
  }

  return (
    <div className="flex h-screen">
      {(isMobileView ? showChatList : true) && (
        <div className={`${isMobileView ? 'w-full' : 'w-1/3 max-w-md'} ${isMobileView && !showChatList ? 'hidden' : ''}`}>
          <ChatList 
            socket={socket} 
            setCurrentUser={handleSelectChat} 
            myNumber={myNumber}
          />
        </div>
      )}

      {(isMobileView ? !showChatList : true) && (
        <div className={`${isMobileView ? 'w-full' : 'w-2/3 flex-1'}`}>
          <ChatMessage 
            myNumber={myNumber} 
            currentUserNumber={myNumber} 
            currentUser={currentUser}
            onBackToList={handleBackToList}
          />
        </div>
      )}
    </div>
  );
};

export default ChatApp;