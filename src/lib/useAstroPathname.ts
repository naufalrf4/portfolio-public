import { useEffect, useState } from 'react';

function readPathname(fallbackPath: string) {
  if (typeof window === 'undefined') {
    return fallbackPath;
  }

  return window.location.pathname || fallbackPath;
}

export function useAstroPathname(initialPath: string) {
  const [pathname, setPathname] = useState(() => readPathname(initialPath));

  useEffect(() => {
    function syncPathname() {
      setPathname(readPathname(initialPath));
    }

    syncPathname();
    document.addEventListener('astro:page-load', syncPathname);
    window.addEventListener('popstate', syncPathname);

    return () => {
      document.removeEventListener('astro:page-load', syncPathname);
      window.removeEventListener('popstate', syncPathname);
    };
  }, [initialPath]);

  return pathname;
}
