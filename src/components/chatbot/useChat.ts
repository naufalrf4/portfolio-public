import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage, confirmAction } from './chat.service';
import { useChatSession } from './useChatSession';
import { getLastAssistantMessageId } from './messageUtils';
import type { Message } from './types';

const MESSAGE_STORAGE_KEY = 'portfolio-chat-messages-v1';

interface UseChat {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  streamingMessageId: string | null;
  shouldScrollToBottom: boolean;
  confirmPendingAction: (messageId: string, confirm: boolean) => Promise<void>;
  confirmingMessageId: string | null;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function simulateStreaming(text: string, onChunk: (chunk: string) => void, onComplete: () => void) {
  const words = text.split(' ');
  let currentIndex = 0;
  let accumulated = '';

  const interval = setInterval(() => {
    if (currentIndex < words.length) {
      accumulated += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
      onChunk(accumulated);
      currentIndex++;
    } else {
      clearInterval(interval);
      onComplete();
    }
  }, 50);

  return interval;
}

function readStoredMessages(): Message[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(MESSAGE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((message) => {
      if (!message || typeof message !== 'object') {
        return [];
      }

      return [
        {
          ...message,
          timestamp: new Date(message.timestamp),
        },
      ];
    });
  } catch {
    return [];
  }
}

function persistMessages(messages: Message[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const lastAssistantMessageId = getLastAssistantMessageId(messages);

    window.localStorage.setItem(
      MESSAGE_STORAGE_KEY,
      JSON.stringify(
        messages.map(({ suggestedActions, ...message }) => ({
          ...message,
          ...(message.id === lastAssistantMessageId ? { suggestedActions } : {}),
          timestamp: message.timestamp.toISOString(),
        }))
      )
    );
  } catch {
  }
}

function clearStoredMessages() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(MESSAGE_STORAGE_KEY);
  } catch {
  }
}

export function useChat(): UseChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasHydratedMessages, setHasHydratedMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [confirmingMessageId, setConfirmingMessageId] = useState<string | null>(null);
  const { sessionId, setSessionId, clearSession } = useChatSession();
  const streamingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    setMessages(readStoredMessages());
    setHasHydratedMessages(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedMessages) {
      return;
    }

    persistMessages(messages);
  }, [hasHydratedMessages, messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSendingRef.current) return;
      isSendingRef.current = true;

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setShouldScrollToBottom(true);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage({
          request: {
            sessionId: sessionId || undefined,
            message: content.trim(),
          },
        });

        if (response.sessionId) {
          setSessionId(response.sessionId);
        }

        setIsLoading(false);

        const assistantMessageId = generateId();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          sources: response.sources,
          suggestedActions: response.suggestedActions,
          metadata: response.metadata,
          pendingAction: response.pendingAction,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setShouldScrollToBottom(true);
        setStreamingMessageId(assistantMessageId);

        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
        }

        streamingIntervalRef.current = simulateStreaming(
          response.message,
          (chunk) => {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: chunk } : msg))
            );
          },
          () => {
            setStreamingMessageId(null);
            streamingIntervalRef.current = null;
            setShouldScrollToBottom(false);
          }
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        setIsLoading(false);
      } finally {
        isSendingRef.current = false;
      }
    },
    [sessionId, setSessionId]
  );

  const confirmPendingAction = useCallback(
    async (messageId: string, confirm: boolean) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message?.pendingAction) return;
      if (!sessionId) {
        setError('Chat session expired. Please send your request again.');
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, pendingAction: undefined } : m
        )
      );

      const action = message.pendingAction;

      setConfirmingMessageId(messageId);

      try {
        const result = await confirmAction(action.actionId, confirm, sessionId);

        const resultMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: confirm ? result.message : 'Action cancelled.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, resultMessage]);
        setShouldScrollToBottom(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to confirm action';
        setError(errorMessage);
      } finally {
        setConfirmingMessageId(null);
      }
    },
    [messages, sessionId]
  );

  const clearMessages = useCallback(() => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setMessages([]);
    setError(null);
    setStreamingMessageId(null);
    setShouldScrollToBottom(false);
    clearStoredMessages();
    clearSession();
  }, [clearSession]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    streamingMessageId,
    shouldScrollToBottom,
    confirmPendingAction,
    confirmingMessageId,
  };
}
