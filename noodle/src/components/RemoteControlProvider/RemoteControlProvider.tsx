import * as React from 'react';
import { CAMERA_TRACK_NAME, MIC_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '@constants/User';
import { useRoomStore } from '@api/useRoomStore';
import { media } from '@src/media';

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

  React.useEffect(() => {
    function onMessage(participantId: string, rawMessage: string) {
      try {
        const parsed = JSON.parse(rawMessage.toString());
        // if this is a mute operation aimed at our session
        if (parsed.op === 'mute' && parsed.sessionId === localSessionId) {
          // mute the track we were asked to
          switch (parsed.track) {
            case CAMERA_TRACK_NAME:
              media.stopCamera();
              break;
            case MIC_TRACK_NAME:
              media.stopMicrophone();
              break;
            case SCREEN_SHARE_TRACK_NAME:
              media.stopScreenShare();
              break;
          }
        }
      } catch (err) {
        // nothing to do really - this was not a JSON encoded message.
      }
    }
    media.on('message', onMessage);
    return () => void media.off('message', onMessage);
  }, [localSessionId]);

  const muteSession = React.useCallback((sessionId: string, track: MutableTrackName) => {
    media.broadcastMessage(
      JSON.stringify({
        op: 'mute',
        sessionId,
        track,
      })
    );
  }, []);

  return <RemoteControlContext.Provider value={{ muteSession }}>{children}</RemoteControlContext.Provider>;
};
