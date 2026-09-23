import React, { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket } from '../socket/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Owns the single live socket connection for an authenticated session, so
// every consumer (ChatContext, ChatList, ChatWindow) shares the same socket
// instance instead of each managing its own.
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }
    setSocket(connectSocket());
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
