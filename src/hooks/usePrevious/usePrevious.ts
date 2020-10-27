import { useRef, useEffect } from 'react';
/**
 * Returns the value of anything from the previous render
 */
export function usePrevious<T>(value: T) {
  const prevRef = useRef(value);

  useEffect(() => {
    prevRef.current = value;
  }, [value]);

  return prevRef.current;
}
