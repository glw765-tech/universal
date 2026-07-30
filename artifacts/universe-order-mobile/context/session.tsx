import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionContextType {
  sessionToken: string | null;
  isReady: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionToken: null,
  isReady: false,
});

function generateToken(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9) +
    Math.random().toString(36).substr(2, 9)
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let token = await AsyncStorage.getItem('universe_session_token');
        if (!token) {
          token = generateToken();
          await AsyncStorage.setItem('universe_session_token', token);
        }
        setSessionToken(token);
      } catch {
        setSessionToken(generateToken());
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <SessionContext.Provider value={{ sessionToken, isReady }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
