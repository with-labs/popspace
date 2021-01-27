import { useContext } from 'react';
import { MediaReadinessContext } from './MediaReadinessProvider';

export function useMediaReady() {
  const ctx = useContext(MediaReadinessContext);
  return ctx.isReady;
}
