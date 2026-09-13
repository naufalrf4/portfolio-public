import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'portfolio-chat-session-id';

interface UseChatSession {
  sessionId: string | null;
  setSessionId: (id: string) => void;
  clearSession: () => void;
}

export function useChatSession(): UseChatSession {
  const [sessionId, setSessionIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSessionIdState(stored);
    }
  }, []);

  const setSessionId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setSessionIdState(id);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionIdState(null);
  }, []);

  return {
    sessionId,
    setSessionId,
    clearSession,
  };
}
