import { useRef, useEffect } from 'react';

/**
 * Returns a ref whose current value is false if the component
 * has been unmounted - helpful for managing effect results which
 * invoke async actions and avoid "set state on unmounted component"
 * errors.
 */
export function useIsMountedRef() {
  const isMountedRef = useRef(true);
  useEffect(() => () => void (isMountedRef.current = false), []);
  return isMountedRef;
}
