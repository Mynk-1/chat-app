import { io } from 'socket.io-client';

let socket;

export const connectSocket = (phoneNumber) => {
  if (!socket) {
    socket = io('https://chat-app-backend-2vt3.onrender.com', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to socket server with ID:', socket.id);

      // Emit phoneNumber to server to update socket ID in database
      socket.emit('sendPhoneNumber', { phoneNumber, socketId: socket.id });
    });

    

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
