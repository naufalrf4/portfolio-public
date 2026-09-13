import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { getLastAssistantMessageId } from './messageUtils';
import type { Message } from './types';

const GREETING_MESSAGE: Message = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi, I'm Nau AI. Ask about my work, random ideas, general knowledge, or just start a casual conversation.",
  timestamp: new Date(0),
};

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  shouldScrollToBottom?: boolean;
  onConfirmAction?: (messageId: string, confirm: boolean) => Promise<void>;
  confirmingMessageId?: string | null;
  streamingMessageId?: string | null;
  onSelectSlot?: (slotId: string) => Promise<void>;
}

export function MessageList({
  messages,
  isLoading,
  shouldScrollToBottom = false,
  onConfirmAction,
  confirmingMessageId = null,
  streamingMessageId = null,
  onSelectSlot,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const hasNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (hasNewMessage && shouldScrollToBottom) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages.length, shouldScrollToBottom]);

  useEffect(() => {
    if (isLoading) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isLoading]);

  useEffect(() => {
    if (shouldScrollToBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  if (messages.length === 0) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto bg-bg-card p-5',
          'scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent'
        )}
      >
        <div className="mx-auto w-full max-w-4xl">
          <MessageBubble message={GREETING_MESSAGE} />
        </div>
      </div>
    );
  }

  const lastAssistantMessageId = getLastAssistantMessageId(messages);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto bg-bg-card p-5',
        'scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent'
      )}
    >
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={message.id === streamingMessageId}
            isLastAssistantMessage={message.id === lastAssistantMessageId}
            onConfirmAction={onConfirmAction}
            isConfirming={confirmingMessageId === message.id}
            onSelectSlot={onSelectSlot}
            isSlotSelectionDisabled={isLoading}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl rounded-bl-md border border-line bg-bg-elevated px-4 py-3">
              <div className="text-sm text-text-secondary font-medium">Thinking...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
