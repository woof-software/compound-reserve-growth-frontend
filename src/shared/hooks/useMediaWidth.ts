import { useEffect, useState } from 'react';

const useMediaWidth = () => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window?.innerWidth : 0
  );

  const isMobile = width < 768;

  const isTablet = width >= 768 && width < 1024;

  const isDesktop = width >= 1024;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onResize = () => setWidth(window.innerWidth);

      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
      };
    }
  }, []);

  return {
    width,
    isMobile,
    isTablet,
    isDesktop
  };
};

export { useMediaWidth };
