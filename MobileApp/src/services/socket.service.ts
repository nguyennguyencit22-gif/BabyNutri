import { io, Socket } from 'socket.io-client';
import { getAuthToken, API_BASE_URL } from './api';

const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

// Single shared connection for the chat feature — opened lazily when a
// chat screen actually needs it, reused across screens while the app is
// running. The JWT is re-read fresh on every (re)connect so a stale token
// from before login can't linger.
export async function getSocket(): Promise<Socket> {
  const token = await getAuthToken();

  if (!socket) {
    socket = io(SOCKET_BASE_URL, {
      auth: { token },
      autoConnect: false,
    });
  } else {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
