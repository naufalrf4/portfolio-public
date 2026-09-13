import { useState, useCallback, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    if (value.trim() && !isLoading) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t border-line bg-bg-elevated p-4 md:p-5">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          className={cn(
            'flex-1 rounded-lg border border-line bg-bg-card px-4 py-3 text-text-primary',
            'focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/40',
            'placeholder:text-text-tertiary',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Chat message input"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className={cn(
            'rounded-lg px-4 py-3',
            'bg-teal text-bg',
            'shadow-[0_8px_24px_-8px_var(--teal-glow)]',
            'hover:brightness-110',
            'hover:scale-105',
            'active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
