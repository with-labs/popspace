import { useContext } from 'react';
import { localTracksContext } from '../localTracksContext';

export function useLocalTracks() {
  const ctx = useContext(localTracksContext);

  if (!ctx) {
    throw new Error('useLocalTracks must be called within a LocalTracksProvider');
  }

  return ctx;
}
