'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextType {
  uuid: string | null;
  karma: number;
  skipCount: number;
  updateSessionInfo: (info: { uuid?: string; karma?: number; skipCount?: number }) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [uuid, setUuid] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      let storedUuid = localStorage.getItem('chatly_uuid');
      if (!storedUuid) {
        storedUuid = uuidv4();
        localStorage.setItem('chatly_uuid', storedUuid);
      }
      return storedUuid;
    }
    return null;
  });
  const [karma, setKarma] = useState(0);
  const [skipCount, setSkipCount] = useState(0);

  const updateSessionInfo = (info: { uuid?: string; karma?: number; skipCount?: number }) => {
    if (info.uuid && info.uuid !== uuid) {
      setUuid(info.uuid);
      localStorage.setItem('chatly_uuid', info.uuid);
    }
    if (info.karma !== undefined) setKarma(info.karma);
    if (info.skipCount !== undefined) setSkipCount(info.skipCount);
  };

  return (
    <SessionContext.Provider value={{ uuid, karma, skipCount, updateSessionInfo }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
