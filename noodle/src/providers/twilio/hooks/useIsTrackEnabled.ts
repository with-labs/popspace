import { useState, useEffect } from 'react';
import { LocalAudioTrack, LocalVideoTrack, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

type TrackType = LocalAudioTrack | LocalVideoTrack | RemoteAudioTrack | RemoteVideoTrack | null | undefined;

export default function useIsTrackEnabled(track: TrackType) {
  const [isEnabled, setIsEnabled] = useState(track ? track.isEnabled : true);

  useEffect(() => {
    if (track) {
      setIsEnabled(track.isEnabled);
      const setEnabled = () => setIsEnabled(true);
      const setDisabled = () => setIsEnabled(false);
      track.on('enabled', setEnabled);
      track.on('disabled', setDisabled);
      return () => {
        track.off('enabled', setEnabled);
        track.off('disabled', setDisabled);
      };
    } else {
      setIsEnabled(false);
    }
  }, [track]);

  return isEnabled;
}
