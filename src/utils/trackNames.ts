import { RemoteTrackPublication, LocalTrackPublication, LocalParticipant, RemoteParticipant } from 'twilio-video';
import { v4 } from 'uuid';

const TRACK_NAME_DELIMITER = '#';

/** Requires special logic since track names are partially randomized for dedup */
export function trackNameMatches(trackName: string, name: string) {
  return trackName.startsWith(`${name}${TRACK_NAME_DELIMITER}`);
}

export function hasTrackName(
  track: LocalTrackPublication | RemoteTrackPublication | undefined | null,
  name: string | undefined | null
) {
  return !!track && !!name && trackNameMatches(track.trackName, name);
}

export function findTrackByName(participant: LocalParticipant | RemoteParticipant, trackName: string) {
  const tracks = participant.tracks;
  let found: LocalTrackPublication | RemoteTrackPublication | null = null;
  for (const t of tracks.values()) {
    if (hasTrackName(t, trackName)) {
      found = t;
    }
  }
  return found;
}

export function getTrackName(track: LocalTrackPublication | RemoteTrackPublication | null) {
  if (!track) return null;
  const [name] = track.trackName.split(TRACK_NAME_DELIMITER);
  return name;
}

export function createTrackName(baseName: string) {
  return `${baseName}${TRACK_NAME_DELIMITER}${v4()}`;
}
