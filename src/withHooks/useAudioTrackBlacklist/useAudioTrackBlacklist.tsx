import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useHuddleContext from '../useHuddleContext/useHuddleContext';

/**
 * Custom hook to procure a list of participant sids that need to be muted in the local participant's client.
 * There are two conditions for a remote participant to be muted:
 * 1. Local participant is in a huddle and the remote participant is not in that huddle.
 * 2. Local participant is not in a huddle and the remote participant is in a huddle.
 */
export default function useAudioTrackBlacklist() {
  const {
    room: { participants, localParticipant },
  } = useVideoContext();
  const { huddles } = useHuddleContext();

  const isInHuddle = !!huddles[localParticipant.sid];

  const blacklist: string[] = [];
  Array.from(participants.values()).forEach(pt => {
    if (isInHuddle && huddles[pt.sid] !== huddles[localParticipant.sid]) {
      blacklist.push(pt.sid);
    } else if (!isInHuddle && huddles[pt.sid]) {
      blacklist.push(pt.sid);
    }
  }, []);

  return blacklist;
}
