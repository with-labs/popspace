import * as React from 'react';
import { RemoteParticipant } from 'twilio-video';
import { RoomEvent } from '../../constants/twilio';
import { CAMERA_TRACK_NAME, MIC_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '../../constants/User';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useRoomStore } from '../../roomState/useRoomStore';
import { useLocalTracks } from '../LocalTracksProvider/useLocalTracks';

type MutableTrackName = typeof CAMERA_TRACK_NAME | typeof MIC_TRACK_NAME | typeof SCREEN_SHARE_TRACK_NAME;

export const RemoteControlContext = React.createContext<{
  muteSession: (sessionId: string, track: MutableTrackName) => void;
} | null>(null);

/**
 * Provides functionality to mute other devices associated with your user
 * by session ID
 */
export const RemoteControlProvider: React.FC = ({ children }) => {
  const localSessionId = useRoomStore((room) => room.sessionId);
  const userId = useCurrentUserProfile().user?.id;

  const { room } = useVideoContext();

  const { dataTrack, stopAudio, stopVideo, stopScreenShare } = useLocalTracks();

  React.useEffect(() => {
    if (!room) return;
    function onMessage(rawMessage: string, track: any, participant: RemoteParticipant) {
      // for now we authenticate the message as being from another participant
      // with our same user ID
      if (!participant.identity.startsWith(`${userId}#`)) return;
      try {
        const parsed = JSON.parse(rawMessage);
        // if this is a mute operation aimed at our session
        if (parsed.op === 'mute' && parsed.sessionId === localSessionId) {
          // mute the track we were asked to
          switch (parsed.track) {
            case CAMERA_TRACK_NAME:
              stopVideo();
              break;
            case MIC_TRACK_NAME:
              stopAudio();
              break;
            case SCREEN_SHARE_TRACK_NAME:
              stopScreenShare();
              break;
          }
        }
      } catch (err) {
        // nothing to do really - this was not a JSON encoded message.
      }
    }
    room.on(RoomEvent.TrackMessage, onMessage);
    return () => void room.off(RoomEvent.TrackMessage, onMessage);
  }, [room, userId, localSessionId, stopVideo, stopAudio, stopScreenShare]);

  const muteSession = React.useCallback(
    (sessionId: string, track: MutableTrackName) => {
      dataTrack.send(
        JSON.stringify({
          op: 'mute',
          sessionId,
          track,
        })
      );
    },
    [dataTrack]
  );

  return <RemoteControlContext.Provider value={{ muteSession }}>{children}</RemoteControlContext.Provider>;
};
