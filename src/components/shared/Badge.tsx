import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono whitespace-nowrap transition-colors duration-300',
        size === 'sm' && 'px-2.5 py-0.5 text-[0.7rem]',
        size === 'md' && 'px-3 py-1 text-xs',
        variant === 'default' && 'bg-bg-elevated text-text-secondary border border-line',
        variant === 'accent' && 'bg-[var(--teal-soft)] text-teal border border-teal/30',
        variant === 'outline' && 'bg-transparent border border-amber/40 text-amber',
        className
      )}
    >
      {children}
    </span>
  );
}
