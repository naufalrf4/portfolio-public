import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
  fromCenter?: boolean;
}

const THEME_KEY = 'theme';

function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyThemeAttr(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function AnimatedThemeToggler({
  className,
  duration = 550,
  fromCenter = false,
  ...props
}: AnimatedThemeTogglerProps) {
  const [isDark, setIsDark] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const update = () => setIsDark(getCurrentTheme() === 'dark');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.magicuiThemeVt === 'active'
    ) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x: number;
    let y: number;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const rect = button.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const applyTheme = () => {
      const next: Theme = isDark ? 'light' : 'dark';
      applyThemeAttr(next);
      setIsDark(next === 'dark');
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
      }
    };

    if (typeof document.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    const clipPath: [string, string] = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${maxRadius}px at ${x}px ${y}px)`,
    ];

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
    };

    isTransitioningRef.current = true;
    const transition = document.startViewTransition(() => {
      applyTheme();
    });

    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    transition?.ready
      ?.then(() => {
        document.documentElement.animate(
          { clipPath },
          {
            duration,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => {});
  }, [duration, fromCenter, isDark]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-300 hover:text-teal hover:bg-bg-elevated',
        className
      )}
      {...props}
    >
      <span className="relative block h-[18px] w-[18px] overflow-hidden">
        <Sun
          size={18}
          className={`absolute inset-0 transition-all duration-300 ${isDark ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-3 rotate-90 opacity-0'}`}
        />
        <Moon
          size={18}
          className={`absolute inset-0 transition-all duration-300 ${!isDark ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-3 -rotate-90 opacity-0'}`}
        />
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
