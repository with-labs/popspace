import { useCallback } from 'react';
import { useLocalTracks } from './useLocalTracks';

export default function useScreenShareToggle() {
  const { screenShareVideoTrack, screenShareAudioTrack, startScreenShare, stopScreenShare } = useLocalTracks();

  const anyScreenShareTrack = screenShareVideoTrack || screenShareAudioTrack;
  const toggleScreenShareEnabled = useCallback(async () => {
    if (anyScreenShareTrack) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [anyScreenShareTrack, stopScreenShare, startScreenShare]);

  return [!!anyScreenShareTrack, toggleScreenShareEnabled] as const;
}
