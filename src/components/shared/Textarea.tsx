import { cn } from '../../lib/utils';
import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-bg-elevated text-text-primary min-h-[120px] resize-y border border-line',
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

Textarea.displayName = 'Textarea';
