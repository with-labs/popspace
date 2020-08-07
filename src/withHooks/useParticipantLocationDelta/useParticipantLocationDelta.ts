import { useMemo } from 'react';
import { Participant } from 'twilio-video';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMeta } from '../useParticipantMeta/useParticipantMeta';
import { LocationTuple } from '../../types';

/*
 * Compare the location of a given remote participant against the local participant
 * Returns distance
 */
export function useParticipantLocationDelta(participant: Participant) {
  const {
    room: { localParticipant },
  } = useVideoContext();
  const [xRp, yRp]: LocationTuple = useParticipantMeta(participant).location;
  const [xLp, yLp]: LocationTuple = useParticipantMeta(localParticipant).location;

  const distanceData = useMemo(() => {
    const xDelta: number = Math.abs(xLp - xRp);
    const yDelta: number = Math.abs(yLp - yRp);
    // equation calculating the distance between two points in x,y plane
    const distance: number = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));

    return distance;
  }, [xRp, yRp, xLp, yLp]);

  return distanceData;
}
