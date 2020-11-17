import useVideoContext from '../useVideoContext/useVideoContext';

export function useLocalParticipant() {
  const { room } = useVideoContext();
  return room?.localParticipant ?? null;
}
