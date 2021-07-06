import { useCallback } from 'react';
import { useLocalTracks } from './useLocalTracks';
import { Analytics } from '@analytics/Analytics';
import { EventNames } from '@analytics/constants';

export default function useScreenShareToggle() {
  const { screenShareVideoTrack, screenShareAudioTrack, startScreenShare, stopScreenShare } = useLocalTracks();

  const anyScreenShareTrack = screenShareVideoTrack || screenShareAudioTrack;
  const toggleScreenShareEnabled = useCallback(async () => {
    Analytics.trackEvent(EventNames.TOGGLE_SCREENSHARE, !anyScreenShareTrack, {
      isOn: !anyScreenShareTrack,
      timestamp: new Date().getTime(),
    });

    if (anyScreenShareTrack) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [anyScreenShareTrack, stopScreenShare, startScreenShare]);

  return [!!anyScreenShareTrack, toggleScreenShareEnabled] as const;
}
