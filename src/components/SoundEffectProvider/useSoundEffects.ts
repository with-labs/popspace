import { useContext } from 'react';
import { SoundEffectContext } from './SoundEffectProvider';

export function useSoundEffects() {
  const ctx = useContext(SoundEffectContext);
  if (!ctx) {
    throw new Error('useSoundEffects must be called within SoundEffectProvider');
  }
  return ctx;
}
