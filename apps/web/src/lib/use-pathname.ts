import { useEffect, useState } from 'react';
import { normalizePathname } from '@/lib/routes';

const NAVIGATION_EVENT = 'nestforge:navigation';

export function navigateTo(pathname: string) {
  const nextPathname = normalizePathname(pathname);

  if (normalizePathname(window.location.pathname) === nextPathname) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  window.history.pushState({}, '', nextPathname);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
  window.scrollTo({ top: 0 });
}

export function usePathname() {
  const [pathname, setPathname] = useState(() =>
    normalizePathname(window.location.pathname),
  );

  useEffect(() => {
    const updatePathname = () =>
      setPathname(normalizePathname(window.location.pathname));

    window.addEventListener('popstate', updatePathname);
    window.addEventListener(NAVIGATION_EVENT, updatePathname);

    return () => {
      window.removeEventListener('popstate', updatePathname);
      window.removeEventListener(NAVIGATION_EVENT, updatePathname);
    };
  }, []);

  return pathname;
}
