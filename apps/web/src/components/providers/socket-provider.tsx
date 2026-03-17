'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from './session-provider';

interface MatchData {
  roomId: string;
  topic: string;
  icebreakerPrompt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastMatch: MatchData | null;
  setLastMatch: (match: MatchData | null) => void;
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null, 
  isConnected: false,
  lastMatch: null,
  setLastMatch: () => {}
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchData | null>(null);
  const { uuid, updateSessionInfo } = useSession();

  useEffect(() => {
    if (!uuid) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Register our session UUID with the server
      socketInstance.emit('register', uuid);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('registered', (data: { uuid?: string; skipCount: number; karma: number }) => {
      updateSessionInfo(data);
    });

    socketInstance.on('matched', (data: MatchData) => {
      setLastMatch(data);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [uuid]); // Re-run if UUID changes (rare/never after init)

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastMatch, setLastMatch }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
