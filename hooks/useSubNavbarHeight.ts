// hooks/useSubNavbarHeight.ts
import { useRef, useEffect, Ref } from 'react';

export const useSubNavbarHeight = (): Ref<HTMLDivElement> => {
  const subNavbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subNavbarRef.current) {
      const height = subNavbarRef.current.offsetHeight;
      document.documentElement.style.setProperty("--sub-navbar-height", `${height}px`);
    }
  }, []);
  return subNavbarRef as Ref<HTMLDivElement>;
};