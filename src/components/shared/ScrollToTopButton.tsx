import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAstroPathname } from '@/lib/useAstroPathname';

interface ScrollToTopButtonProps {
  currentPath: string;
}

export function ScrollToTopButton({ currentPath }: ScrollToTopButtonProps) {
  const pathname = useAstroPathname(currentPath);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      data-analytics-button
      data-entity-type="scroll_to_top"
      data-entity-id={pathname}
      data-entity-label={`Scroll to top: ${pathname}`}
      className={cn(
        'fixed z-[47] flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg-card/90 text-teal backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-line-hover hover:shadow-[0_8px_24px_-8px_var(--teal-glow)]',
        pathname === '/ai-chatbot'
          ? 'bottom-6 right-6 md:bottom-8 md:right-8'
          : 'bottom-24 right-4 md:bottom-24 md:right-6',
        visible
          ? 'pointer-events-auto opacity-100 translate-y-0'
          : 'pointer-events-none opacity-0 translate-y-3'
      )}
    >
      <ChevronUp size={20} />
    </button>
  );
}
