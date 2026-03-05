import { io } from 'socket.io-client';
import { getAccessToken } from './api';

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;
  socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '', {
    auth: { token: getAccessToken() },
    withCredentials: true,
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
