import { useContext } from 'react';

import { ParticipantMetaContext } from './ParticipantMetaProvider';

export function useParticipantMetaContext() {
  const context = useContext(ParticipantMetaContext);

  if (!context) {
    throw new Error('`useParticipantMetaContext` must be used within a ParticipantMetaProvider');
  }

  return context;
}
