import useParticipants from '../useParticipants/useParticipants';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';

export function useParticipant(participantId: string | null) {
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  return [...participants, localParticipant].find((p) => p.sid === participantId) ?? null;
}
