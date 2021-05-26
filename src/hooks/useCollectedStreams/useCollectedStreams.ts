import { useState, useEffect } from 'react';
import { RemoteParticipant, LocalParticipant, LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';
import { RoomEvent } from '@constants/twilio';
import { Stream } from '../../types/streams';
import {
  CAMERA_TRACK_NAME,
  MIC_TRACK_NAME,
  SCREEN_SHARE_TRACK_NAME,
  SCREEN_SHARE_AUDIO_TRACK_NAME,
} from '@constants/User';
import { findTrackByName } from '@utils/trackNames';
import { useTwilio } from '@providers/twilio/TwilioProvider';

type Participant = RemoteParticipant | LocalParticipant;
type Publication = RemoteTrackPublication | LocalTrackPublication;

function getParticipantStreams(participant: Participant): { av: Stream | null; screen: Stream | null } {
  const camera = findTrackByName(participant, CAMERA_TRACK_NAME);
  const microphone = findTrackByName(participant, MIC_TRACK_NAME);
  const screenVideo = findTrackByName(participant, SCREEN_SHARE_TRACK_NAME);
  const screenAudio = findTrackByName(participant, SCREEN_SHARE_AUDIO_TRACK_NAME);

  return {
    av: !!(camera || microphone)
      ? {
          kind: 'av',
          videoPublication: camera,
          audioPublication: microphone,
          id: `${participant.identity}-av`,
          participantIdentity: participant.identity,
        }
      : null,
    screen: !!(screenVideo || screenAudio)
      ? {
          kind: 'screen',
          videoPublication: screenVideo,
          audioPublication: screenAudio,
          id: `${participant.identity}-screen`,
          participantIdentity: participant.identity,
        }
      : null,
  };
}

/**
 * Collects all the streams from all provided Twilio participants
 * into a single list and updates the component when any of the
 * tracks is published or unpublished
 *
 * TODO: add support for filtering to only enabled tracks?
 */
export function useCollectedStreams(participants: Participant[]) {
  const { room } = useTwilio();

  const [allStreams, setAllStreams] = useState(() =>
    participants.reduce((streams, p) => {
      streams[p.identity] = getParticipantStreams(p);
      return streams;
    }, {} as Record<string, { av: Stream | null; screen: Stream | null }>)
  );

  useEffect(() => {
    if (!room) return;

    // when the participant list or room changes, we want to re-populate the
    // stream collection
    setAllStreams(
      participants.reduce((streams, p) => {
        streams[p.identity] = getParticipantStreams(p);
        return streams;
      }, {} as Record<string, { av: Stream | null; screen: Stream | null }>)
    );

    // we also re-subscribe to track change events on the room (remote tracks)
    // and the local participant (local tracks). when tracks change, we
    // refresh that participant's streams.

    const onRoomTracksChanged = (_: Publication, participant: Participant) => {
      if (!participants.includes(participant)) return;
      setAllStreams((current) => {
        return {
          ...current,
          [participant.identity]: getParticipantStreams(participant),
        };
      });
    };

    const onLocalTracksChanged = () => {
      if (!participants.includes(room.localParticipant)) return;
      setAllStreams((current) => {
        return {
          ...current,
          [room.localParticipant.identity]: getParticipantStreams(room.localParticipant),
        };
      });
    };

    room.on(RoomEvent.TrackPublished, onRoomTracksChanged);
    room.on(RoomEvent.TrackUnpublished, onRoomTracksChanged);
    room.localParticipant.on(RoomEvent.TrackPublished, onLocalTracksChanged);
    room.localParticipant.on(RoomEvent.TrackUnpublished, onLocalTracksChanged);

    return () => {
      room.off(RoomEvent.TrackPublished, onRoomTracksChanged);
      room.off(RoomEvent.TrackUnpublished, onRoomTracksChanged);
      room.localParticipant.off(RoomEvent.TrackPublished, onLocalTracksChanged);
      room.localParticipant.off(RoomEvent.TrackUnpublished, onLocalTracksChanged);
    };
  }, [room, participants]);

  return allStreams;
}
