import { useContext } from 'react';
import { ViewportContext } from './ViewportProvider';

export function useViewport() {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error('useViewport must be called inside a ViewportProvider');
  return ctx;
}
