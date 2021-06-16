import { useEffect, useState } from 'react';
import client from './client';
import { Actor } from './types';

/**
 * Provides an up-to-date actor ID for the local client user
 */
export function useLocalActor() {
  const [actor, setActor] = useState(client.actor ?? null);

  useEffect(() => {
    function handleActorChange(actor: Actor | null) {
      setActor(actor ?? null);
    }
    client.on('actorChange', handleActorChange);
    return () => void client.off('actorChange', handleActorChange);
  }, []);

  return actor;
}
