import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Participant } from 'twilio-video';
import { selectors } from '../../features/room/roomSlice';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';

const UNKNOWN_POSITION = { x: 0, y: 0 };

/*
 * Compare the location of a given remote participant against the local participant
 * Returns distance
 */
export function useParticipantLocationDelta(participant: Participant) {
  const localParticipant = useLocalParticipant();

  const { x: xLp, y: yLp } = useSelector(selectors.createPositionSelector(localParticipant.sid)) || UNKNOWN_POSITION;
  const { x: xRp, y: yRp } = useSelector(selectors.createPositionSelector(participant.sid)) || UNKNOWN_POSITION;

  const distanceData = useMemo(() => {
    const xDelta: number = Math.abs(xLp - xRp);
    const yDelta: number = Math.abs(yLp - yRp);
    // equation calculating the distance between two points in x,y plane
    const distance: number = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));

    return distance;
  }, [xRp, yRp, xLp, yLp]);

  return distanceData;
}
