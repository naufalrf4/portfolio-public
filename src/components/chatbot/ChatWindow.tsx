import { cn } from '@/lib/utils';
import { useChat } from './useChat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { PoweredBy } from './PoweredBy';
import { AlertCircle } from 'lucide-react';

interface ChatWindowProps {
  onClose?: () => void;
  isFullPage?: boolean;
  className?: string;
}

export function ChatWindow({ onClose, isFullPage = false, className }: ChatWindowProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    shouldScrollToBottom,
    confirmPendingAction,
    confirmingMessageId,
    streamingMessageId,
  } = useChat();

  const chatCard = (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl bg-bg-card',
        'shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)]',
        'border border-line',
        isFullPage ? 'h-full min-h-0' : 'h-full',
        !isFullPage && className
      )}
    >
      <ChatHeader onClose={onClose} onClear={clearMessages} isFullPage={isFullPage} />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        shouldScrollToBottom={shouldScrollToBottom}
        onConfirmAction={confirmPendingAction}
        confirmingMessageId={confirmingMessageId}
        streamingMessageId={streamingMessageId}
        onSelectSlot={sendMessage}
      />

      {error && (
        <div className="border-t border-[var(--error)]/40 bg-[var(--error)]/10 px-4 py-2">
          <div className="flex items-center gap-2 text-[var(--error)] text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <ChatInput onSend={sendMessage} isLoading={isLoading} />
      <PoweredBy className="border-t border-line bg-bg-elevated py-2" />
    </div>
  );

  if (!isFullPage) {
    return chatCard;
  }

  return (
    <div
      className={cn(
        'grid h-full min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3',
        'lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:grid-rows-none lg:gap-8',
        className
      )}
    >
      <ChatSidebar onSelectPrompt={sendMessage} isLoading={isLoading} />
      {chatCard}
    </div>
  );
}
