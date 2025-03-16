// hooks/useNavbarHeight.ts
import { useRef, useEffect, Ref } from 'react';

export const useNavbarHeight = (): Ref<HTMLDivElement> => {
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      document.documentElement.style.setProperty("--navbar-height", `${height}px`);
    }
  }, []);

  return navbarRef as Ref<HTMLDivElement>;
};