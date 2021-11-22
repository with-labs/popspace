import * as React from 'react';
import { useLocalTracksState } from './useLocalTracksState';

export const localTracksContext = React.createContext<ReturnType<typeof useLocalTracksState> | null>(null);
