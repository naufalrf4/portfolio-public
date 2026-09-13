import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useAstroPathname } from '@/lib/useAstroPathname';

const WIDGET_STATE_KEY = 'portfolio-chat-widget-open';

interface ChatWidgetProps {
  currentPath: string;
}

export function ChatWidget({ currentPath }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useAstroPathname(currentPath);

  useEffect(() => {
    if (pathname !== '/ai-chatbot') {
      return;
    }

    setIsOpen(false);
    sessionStorage.removeItem(WIDGET_STATE_KEY);
  }, [pathname]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      sessionStorage.removeItem(WIDGET_STATE_KEY);
      return;
    }

    const stored = sessionStorage.getItem(WIDGET_STATE_KEY);
    if (stored === 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (window.innerWidth < 768) {
      window.location.href = '/ai-chatbot';
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      sessionStorage.removeItem(WIDGET_STATE_KEY);
    } else {
      setIsOpen(true);
      sessionStorage.setItem(WIDGET_STATE_KEY, 'true');
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.removeItem(WIDGET_STATE_KEY);
  }, []);

  if (pathname === '/ai-chatbot') {
    return null;
  }

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          'fixed bottom-28 md:bottom-6 left-4 md:left-auto md:right-6 z-[60]',
          'w-14 h-14 rounded-full',
          'bg-teal text-bg',
          'shadow-[0_8px_24px_-8px_var(--teal-glow)]',
          'hover:shadow-[0_12px_32px_-8px_var(--teal-glow)]',
          'hover:scale-105',
          'active:scale-95',
          'transition-transform duration-300',
          'flex items-center justify-center'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-[60] bottom-24 right-6 w-96 h-[500px]'
            )}
          >
            <ChatWindow onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
