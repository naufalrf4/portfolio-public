import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { QUICK_PROMPTS } from './constants';

interface ChatSidebarProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
  className?: string;
}

const KNOWS_ABOUT = ['Projects', 'Tech stack', 'Experience', 'Writing'];

export function ChatSidebar({ onSelectPrompt, isLoading, className }: ChatSidebarProps) {
  return (
    <aside aria-label="Chat assistant sidebar" className={cn('lg:flex lg:flex-col lg:gap-6', className)}>
      {/* Identity block — hidden on mobile */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-teal/30 bg-[var(--teal-soft)]">
            <Sparkles size={20} className="text-teal" />
          </div>
          <h2 className="text-lg font-bold font-display text-text-primary">Nau AI</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Grounded in my portfolio, projects, and writing.
        </p>
      </div>

      {/* Knows about — hidden on mobile */}
      <div className="hidden lg:block">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
          Knows about
        </p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {KNOWS_ABOUT.map((item) => (
            <li key={item} className="py-2.5 text-sm text-text-secondary">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Try asking — wrapped chips on mobile, stacked list on lg+ */}
      <div>
        <p className="hidden font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary lg:block">
          Try asking
        </p>
        <div className="flex flex-wrap gap-2 lg:mt-3 lg:flex-col lg:flex-nowrap">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              disabled={isLoading}
              data-analytics-button
              data-entity-type="chat_sidebar_prompt"
              data-entity-id={prompt}
              data-entity-label={prompt}
              className={cn(
                'rounded-full border border-line bg-bg-elevated px-3 py-1.5',
                'text-left text-xs font-medium text-text-secondary transition-colors',
                'hover:border-teal/40 hover:text-teal hover:bg-[var(--teal-soft)]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-text-secondary disabled:hover:bg-bg-elevated',
                'lg:w-full lg:rounded-xl lg:px-3.5 lg:py-2.5'
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Footnote — hidden on mobile */}
      <p className="hidden text-xs leading-relaxed text-text-tertiary lg:block">
        AI can make mistakes. Check the sources it cites.
      </p>
    </aside>
  );
}
