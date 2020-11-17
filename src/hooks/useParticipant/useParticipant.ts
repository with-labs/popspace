import useVideoContext from '../useVideoContext/useVideoContext';

export function useParticipant(participantId: string | null) {
  const { allParticipants } = useVideoContext();

  return allParticipants.find((p) => p?.sid === participantId) ?? null;
}
