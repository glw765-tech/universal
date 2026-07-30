import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'universe_session_token_v1';

interface SessionContextValue {
  sessionToken: string | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  sessionToken: null,
  isLoading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrCreate() {
      try {
        let token = await AsyncStorage.getItem(SESSION_KEY);
        if (!token) {
          // Generate a unique session ID without using uuid package
          token =
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 9) +
            Math.random().toString(36).substring(2, 9);
          await AsyncStorage.setItem(SESSION_KEY, token);
        }
        setSessionToken(token);
      } catch {
        // Fallback to in-memory token if AsyncStorage fails
        const token =
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 9);
        setSessionToken(token);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrCreate();
  }, []);

  return (
    <SessionContext.Provider value={{ sessionToken, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
