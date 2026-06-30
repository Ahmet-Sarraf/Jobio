import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocketAsync = (token: string | null): Socket | null => {
  if (socket) {
    return socket;
  }

  if (!token) return null;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.251.93.165:3000';

  // Sockets are connected to the root domain of the api url
  // If EXPO_PUBLIC_API_URL contains a path, we strip it out (e.g. replace '/api', '')
  const socketUrl = apiUrl.replace(/\/api$/, '');

  socket = io(socketUrl, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    autoConnect: false, // We will connect manually
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
