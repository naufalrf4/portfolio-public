import { cn } from '../../lib/utils';
import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'default', size = 'md', isLoading, children, className, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-6 py-3 text-base',
          size === 'lg' && 'px-8 py-4 text-lg',

          variant === 'default' &&
            'bg-bg-elevated text-text-primary border border-line hover:border-line-hover hover:text-teal hover:-translate-y-0.5 active:translate-y-0',

          (variant === 'primary' || variant === 'accent') &&
            'bg-teal text-bg font-semibold border border-transparent hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_var(--teal-glow)] active:translate-y-0',

          variant === 'ghost' &&
            'bg-transparent text-text-secondary border border-transparent hover:text-teal hover:bg-bg-elevated',

          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 animate-spin">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
