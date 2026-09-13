import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'base' | 'elevated';
  scene?: string;
}

export function Section({ children, className, id, tone = 'base', scene }: SectionProps) {
  return (
    <section
      id={id}
      data-scene={scene}
      className={cn(
        'py-24 md:py-32 overflow-x-hidden',
        tone === 'elevated' && 'bg-bg-elevated border-y border-line',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
