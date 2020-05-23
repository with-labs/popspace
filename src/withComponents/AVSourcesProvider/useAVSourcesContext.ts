import { useContext } from 'react';

import { AVSourcesContext } from './AVSourcesProvider';

export function useAVSourcesContext() {
  const devices = useContext(AVSourcesContext);

  if (!devices) {
    throw new Error('`useAVSourcesContext` must be used within a AVSourcesContextProvider');
  }

  return devices;
}
