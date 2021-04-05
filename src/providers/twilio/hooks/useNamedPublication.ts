import { LocalParticipant, RemoteParticipant, LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';
import { useState, useEffect } from 'react';
import { findTrackByName, hasTrackName } from '../../../utils/trackNames';

/**
 * Monitors track publications for any participant and returns a track by name, if it exists (or null).
 */
export function useNamedPublication(
  participant: LocalParticipant | RemoteParticipant | null,
  trackName: string | null
) {
  // providing an initializer so this immediately has the track if we begin with an initialized participant
  const [track, setTrack] = useState<LocalTrackPublication | RemoteTrackPublication | null>(() => {
    if (!participant || !trackName) return null;
    return findTrackByName(participant, trackName);
  });

  // sync track state when participant or track name changes
  useEffect(() => {
    if (!participant || !trackName) {
      setTrack(null);
      return;
    }

    setTrack(findTrackByName(participant, trackName));
  }, [participant, trackName]);

  // attach publish event listeners
  useEffect(() => {
    if (!participant) return;

    const handlePublish = (pub: LocalTrackPublication | RemoteTrackPublication) => {
      if (trackName && hasTrackName(pub, trackName)) {
        setTrack(pub);
      }
    };
    const handleUnpublish = (pub: LocalTrackPublication | RemoteTrackPublication) => {
      if (trackName && hasTrackName(pub, trackName)) {
        setTrack(null);
      }
    };
    participant.on('trackPublished', handlePublish);
    participant.on('trackUnpublished', handleUnpublish);
    return () => {
      participant.off('trackPublished', handlePublish);
      participant.off('trackUnpublished', handleUnpublish);
    };
  }, [participant, trackName]);

  return track;
}
