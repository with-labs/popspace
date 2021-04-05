import * as React from 'react';
import { useLocalTracksState } from './useLocalTracksState';
import { useAppState } from '../../state';
import { localTracksContext } from './localTracksContext';

export const LocalTracksProvider: React.FC = ({ children }) => {
  const { setError } = useAppState();

  const localTracks = useLocalTracksState(setError);

  return <localTracksContext.Provider value={localTracks}>{children}</localTracksContext.Provider>;
};
