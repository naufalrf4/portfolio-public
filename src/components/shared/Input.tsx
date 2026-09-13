import { cn } from '../../lib/utils';
import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-bg-elevated text-text-primary border border-line',
            'focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/40',
            'placeholder:text-text-tertiary',
            'transition-all duration-200',
            error ? 'border-[var(--error)] ring-1 ring-[var(--error)]/40' : '',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
