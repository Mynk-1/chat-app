import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let socket = null;

// The JWT lives in an httpOnly cookie, invisible to this code, so there's no
// token to pass explicitly — it rides along on the handshake request itself
// (the browser attaches it automatically), and socket.auth.js on the backend
// reads it from there. withCredentials is what makes the browser include it
// cross-origin.
export const connectSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
