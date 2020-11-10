import { LocalParticipant, RemoteParticipant, LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';
import { useState, useEffect } from 'react';

function findTrack(participant: LocalParticipant | RemoteParticipant, trackName: string) {
  const tracks = participant.tracks;
  let found: LocalTrackPublication | RemoteTrackPublication | null = null;
  for (const t of tracks.values()) {
    if (t.trackName.startsWith(trackName)) {
      found = t;
    }
  }
  return found;
}

/**
 * Monitors track publications for any participant and returns a track by name, if it exists (or null).
 */
export function useNamedPublication(participant: LocalParticipant | RemoteParticipant | null, trackName: string) {
  // providing an initializer so this immediately has the track if we begin with an initialized participant
  const [track, setTrack] = useState<LocalTrackPublication | RemoteTrackPublication | null>(() => {
    if (!participant) return null;
    return findTrack(participant, trackName);
  });

  // sync track state when participant or track name changes
  useEffect(() => {
    if (!participant) {
      setTrack(null);
      return;
    }

    setTrack(findTrack(participant, trackName));
  }, [participant, trackName]);

  // attach publish event listeners
  useEffect(() => {
    if (!participant) return;

    const handlePublish = (pub: LocalTrackPublication | RemoteTrackPublication) => {
      if (pub.trackName.startsWith(trackName)) {
        setTrack(pub);
      }
    };
    const handleUnpublish = (pub: LocalTrackPublication | RemoteTrackPublication) => {
      if (pub.trackName.startsWith(trackName)) {
        setTrack(null);
      }
    };
    participant.on('trackPublished', handlePublish);
    participant.on('trackUnpublished', handleUnpublish);
    return () => {
      participant.off('trackPublished', handlePublish);
      participant.off('trackUnpublished', handleUnpublish);
    };
  });

  return track;
}
