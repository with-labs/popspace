import { useLocalActorId } from './useLocalActorId';

/** Simple hook to tell if a provided actor is the same as the local client user */
export function useIsMe(actorId: string | number) {
  return useLocalActorId()?.toString() === actorId.toString();
}
