import { useLocalActor } from './useLocalActor';

/**
 * Provides an up-to-date actor ID for the local client user
 */
export function useLocalActorId() {
  return useLocalActor()?.actorId ?? null;
}
