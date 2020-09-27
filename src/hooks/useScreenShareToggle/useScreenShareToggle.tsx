import { useState, useCallback, useRef } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { LogLevels, Track, LocalVideoTrackPublication } from 'twilio-video';

interface MediaStreamTrackPublishOptions {
  name?: string;
  priority: Track.Priority;
  logLevel: LogLevels;
}

export default function useScreenShareToggle() {
  const { room, onError } = useVideoContext();
  const [isSharing, setIsSharing] = useState(false);
  const stopScreenShareRef = useRef<() => void>(null!);

  const sharePub = Array.from(room.localParticipant.tracks.values()).find((track) => track.trackName === 'screen');

  const toggleScreenShare = useCallback(() => {
    if (!sharePub) {
      navigator.mediaDevices
        .getDisplayMedia({
          audio: false,
          video: {
            frameRate: 10,
            height: 1080,
            width: 1920,
          },
        })
        .then((stream) => {
          const track = stream.getTracks()[0];

          // All video tracks are published with 'low' priority. This works because the video
          // track that is displayed in the 'MainParticipant' component will have it's priority
          // set to 'high' via track.setPriority()
          room.localParticipant
            .publishTrack(track, {
              name: 'screen', // Tracks can be named to easily find them later
              priority: 'high',
            } as MediaStreamTrackPublishOptions)
            .then((trackPublication) => {
              stopScreenShareRef.current = () => {
                room.localParticipant.unpublishTrack(track);
                // TODO: remove this if the SDK is updated to emit this event
                room.localParticipant.emit('trackUnpublished', trackPublication);
                track.stop();
                setIsSharing(false);
              };

              track.onended = stopScreenShareRef.current;
              setIsSharing(true);
            })
            .catch(onError);
        })
        .catch((error) => {
          // Don't display an error if the user closes the screen share dialog
          if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            onError(error);
          }
        });
    } else {
      const pub = room.localParticipant.unpublishTrack(sharePub.track) as LocalVideoTrackPublication;
      // TODO: remove this if the SDK is updated to emit this event
      room.localParticipant.emit('trackUnpublished', pub);
      pub.track.stop();
      setIsSharing(false);
    }
  }, [room, onError, sharePub]);

  return [!!sharePub, toggleScreenShare] as const;
}
