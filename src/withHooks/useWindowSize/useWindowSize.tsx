import { useState, useEffect, useMemo } from 'react';

export default function useWindowSize() {
  const isClient = useMemo(() => {
    return typeof window === 'object';
  }, []);

  const [windowSize, setWindowSize] = useState<number[]>([0, 0]);

  useEffect(() => {
    if (isClient) {
      setWindowSize([window.innerWidth, window.innerHeight]);

      function handleResize() {
        setWindowSize([window.innerWidth, window.innerHeight]);
      }

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [setWindowSize, isClient]);

  return windowSize;
}
