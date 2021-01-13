import useVideoContext from '../useVideoContext/useVideoContext';

export function useParticipantByIdentity(identity: string | null) {
  const { allParticipants } = useVideoContext();

  return allParticipants.find((p) => p?.identity === identity) ?? null;
}
