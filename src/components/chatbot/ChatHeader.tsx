import { cn } from '@/lib/utils';
import { Sparkles, RotateCcw, MoreVertical, ExternalLink, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatHeaderProps {
  onClose?: () => void;
  onClear?: () => void;
  isFullPage?: boolean;
}

const iconButtonClassName = cn(
  'rounded-lg p-2.5 text-text-secondary',
  'hover:bg-bg-card hover:text-teal transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-teal/40'
);

export function ChatHeader({ onClose, onClear, isFullPage = false }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between border-b border-line bg-bg-elevated px-5 py-4 text-text-primary md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal/30 bg-[var(--teal-soft)]">
          <Sparkles size={20} className="text-teal" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display">Nau AI</h3>
        </div>
      </div>

      {isFullPage ? (
        onClear && (
          <button
            onClick={onClear}
            className={iconButtonClassName}
            aria-label="Reset chat"
            title="Reset chat"
          >
            <RotateCcw size={18} />
          </button>
        )
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={iconButtonClassName}
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="More options"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Chat options"
                className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-line bg-bg-card py-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]"
              >
                <a
                  href="/ai-chatbot"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-elevated hover:text-teal"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink size={16} />
                  Open full page
                </a>
                {onClear && (
                  <button
                    role="menuitem"
                    onClick={() => {
                      onClear();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-bg-elevated hover:text-teal"
                  >
                    <RotateCcw size={16} />
                    Reset chat
                  </button>
                )}
              </div>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={iconButtonClassName}
              aria-label="Close chat"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
