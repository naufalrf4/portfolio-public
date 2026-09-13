import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  subcopy?: string;
  className?: string;
  centered?: boolean;
}

export function PageHero({ eyebrow, icon: Icon, title, description, subcopy, className, centered }: PageHeroProps) {
  if (eyebrow) {
    const align = centered ?? false;
    return (
      <header className={cn('mb-12 homepage-reveal md:mb-16', align && 'text-center', className)}>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-teal homepage-reveal-soft">
          {eyebrow}
        </p>
        <h1
          className={cn('max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-text-primary md:text-5xl homepage-reveal-soft', align && 'mx-auto')}
          style={{ animationDelay: '0.08s' }}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn('mt-5 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg homepage-reveal-soft', align && 'mx-auto')}
            style={{ animationDelay: '0.16s' }}
          >
            {description}
          </p>
        )}
        {subcopy && (
          <p
            className={cn('mt-3 max-w-2xl font-mono text-xs uppercase tracking-wider text-text-tertiary homepage-reveal-soft', align && 'mx-auto')}
            style={{ animationDelay: '0.22s' }}
          >
            {subcopy}
          </p>
        )}
      </header>
    );
  }

  return (
    <header className={cn('mb-12 text-center homepage-reveal', className)}>
      <div className="mb-6 flex flex-col items-center gap-6">
        {Icon && (
          <div className="card-base flex h-16 w-16 items-center justify-center md:h-20 md:w-20 homepage-card-hover homepage-reveal-pop">
            <Icon className="h-8 w-8 text-teal md:h-10 md:w-10" />
          </div>
        )}
        <h1
          className="text-3xl font-bold font-display text-text-primary md:text-4xl lg:text-5xl homepage-reveal-soft"
          style={{ animationDelay: '0.08s' }}
        >
          {title}
        </h1>
      </div>
      {description && (
        <p
          className="mx-auto max-w-3xl text-lg leading-relaxed text-text-secondary md:text-xl homepage-reveal-soft"
          style={{ animationDelay: '0.16s' }}
        >
          {description}
        </p>
      )}
    </header>
  );
}
