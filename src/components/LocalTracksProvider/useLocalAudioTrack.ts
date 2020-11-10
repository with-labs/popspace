import { useState, useCallback, useEffect } from 'react';
import { LocalAudioTrack, createLocalAudioTrack, CreateLocalTrackOptions } from 'twilio-video';
import { MIC_TRACK_NAME } from '../../constants/User';

export function useLocalAudioTrack(onError?: (err: Error) => void) {
  const [track, setTrack] = useState<LocalAudioTrack | null>(null);

  const start = useCallback(
    async (trackOptions: CreateLocalTrackOptions) => {
      const constraints = {
        name: MIC_TRACK_NAME,
        ...trackOptions,
      };

      try {
        // we already have a video track - restart it with the new constraints
        if (track) {
          await track.restart(constraints);
          setTrack(track);
        } else {
          const newTrack = await createLocalAudioTrack(constraints);
          setTrack(newTrack);
        }
      } catch (err) {
        onError?.(err);
      }
    },
    [track, onError]
  );

  const stop = useCallback(async () => {
    track?.stop();
  }, [track]);

  // subscribe to track ending, and remove it.
  // NOTE: this is also triggered during restart, but that is ok.
  useEffect(() => {
    const handleStopped = () => setTrack(null);
    track?.on('stopped', handleStopped);
    return () => {
      track?.off('stopped', handleStopped);
    };
  }, [track]);

  return [track, start, stop] as const;
}
