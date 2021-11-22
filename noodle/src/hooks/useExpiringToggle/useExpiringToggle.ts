import { useState, useEffect } from 'react';

export function useExpiringToggle(initial: boolean, timeout: number = 2000) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => setValue(false), timeout);
    return () => timer && clearTimeout(timer);
  }, [value, timeout]);
  return [value, setValue] as const;
}
