import { RemoteParticipant, LocalParticipant } from 'twilio-video';
import { useState, useEffect } from 'react';
import { ParticipantState } from '../../constants/twilio';

export function useParticipantState(participant: RemoteParticipant | LocalParticipant | null) {
  const [state, setState] = useState<ParticipantState>(
    (participant?.state as ParticipantState) ?? ParticipantState.Reconnecting
  );

  useEffect(() => {
    if (!participant) return;

    const onStateChange = () => {
      setState((participant?.state as ParticipantState) ?? ParticipantState.Reconnecting);
    };
    participant.on('disconnected', onStateChange).on('reconnecting', onStateChange).on('reconnected', onStateChange);
    return () => {
      participant
        .off('disconnected', onStateChange)
        .off('reconnecting', onStateChange)
        .off('reconnected', onStateChange);
    };
  }, [participant]);

  return state;
}
