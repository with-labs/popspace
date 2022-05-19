import { useState, useEffect } from 'react';
import { Stream } from '../../types/streams';
import { media } from '@src/media';
import { TrackType } from '@withso/pop-media-sdk';

function getParticipantStreams(participantId: string): { av: Stream | null; screen: Stream | null } {
  const camera = media.getParticipantTrack(participantId, TrackType.Camera) || null;
  const microphone = media.getParticipantTrack(participantId, TrackType.Microphone) || null;
  const screenVideo = media.getParticipantTrack(participantId, TrackType.Screen) || null;
  const screenAudio = media.getParticipantTrack(participantId, TrackType.ScreenAudio) || null;

  return {
    av: !!(camera || microphone)
      ? {
          kind: 'av',
          videoTrack: camera,
          audioTrack: microphone,
          id: `${participantId}-av`,
          participantId,
        }
      : null,
    screen: !!(screenVideo || screenAudio)
      ? {
          kind: 'screen',
          videoTrack: screenVideo,
          audioTrack: screenAudio,
          id: `${participantId}-screen`,
          participantId,
        }
      : null,
  };
}

/**
 * Collects all the streams from all provided media participants
 * into a single list and updates the component when any of the
 * tracks is published or unpublished
 *
 * TODO: add support for filtering to only enabled tracks?
 */
export function useCollectedStreams(participants: string[]) {
  const [allStreams, setAllStreams] = useState(() =>
    participants.reduce((streams, p) => {
      streams[p] = getParticipantStreams(p);
      return streams;
    }, {} as Record<string, { av: Stream | null; screen: Stream | null }>)
  );

  useEffect(() => {
    // when the participant list or room changes, we want to re-populate the
    // stream collection
    setAllStreams(
      participants.reduce((streams, p) => {
        streams[p] = getParticipantStreams(p);
        return streams;
      }, {} as Record<string, { av: Stream | null; screen: Stream | null }>)
    );

    // we also re-subscribe to track change events on the room (remote tracks)
    // and the local participant (local tracks). when tracks change, we
    // refresh that participant's streams.

    const onRoomTracksChanged = (participant: string) => {
      if (!participants.includes(participant)) return;
      setAllStreams((current) => {
        return {
          ...current,
          [participant]: getParticipantStreams(participant),
        };
      });
    };

    media.on('trackStarted', onRoomTracksChanged);
    media.on('trackStopped', onRoomTracksChanged);

    return () => {
      media.off('trackStarted', onRoomTracksChanged);
      media.off('trackStopped', onRoomTracksChanged);
    };
  }, [participants]);

  return allStreams;
}
