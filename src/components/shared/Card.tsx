import { cn } from '../../lib/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-2xl border border-line bg-bg-card p-6 transition-colors duration-300',
        hover && 'card-glow-hover hover:border-line-hover',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
