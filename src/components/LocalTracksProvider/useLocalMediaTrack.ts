import { useCallback, useState, useEffect, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import { convertMediaError } from './convertMediaError';
import { LocalAudioTrack, LocalVideoTrack, createLocalAudioTrack, createLocalVideoTrack } from 'twilio-video';
import { MediaTrackEvent } from '../../constants/twilio';
import { v4 } from 'uuid';

function getTrackDeviceId(track: LocalAudioTrack | LocalVideoTrack) {
  const constraints = track.mediaStreamTrack.getConstraints();
  // FireFox reports an empty object for nonexistent device ID, which isn't falsy, so using
  // a more advanced check.
  if (isEmpty(constraints.deviceId)) {
    return null;
  }
  return constraints.deviceId;
}

export type LocalMediaOptions = {
  onError?: (err: Error) => void;
  permissionDeniedMessage?: string;
  permissionDismissedMessage?: string;
};

/**
 * The objective of this hook is to provide a self-contained state system
 * for managing the existence of the user's media tracks. It provides
 * an API which includes:
 * - The track, stateful: will re-render when track existence or identity changes
 * - A Start method to either begin or restart the track
 * - A Stop method to stop and remove the track
 */
export function useLocalMediaTrack(
  kind: 'video' | 'audio',
  name: string,
  deviceId: string | null,
  constraints: MediaTrackConstraints,
  { onError, permissionDeniedMessage, permissionDismissedMessage }: LocalMediaOptions
) {
  // capture this to avoid re-rendering on changes.
  const constraintsRef = useRef(constraints);
  const [track, setTrack] = useState<LocalAudioTrack | LocalVideoTrack | null>(null);

  const start = useCallback(async () => {
    const finalConstraints = {
      ...constraintsRef.current,
      deviceId: deviceId ?? undefined,
      // name is randomized to prevent publish conflicts down the line
      name: `${name}-${v4()}`,
    };

    try {
      if (track) {
        await track.restart(finalConstraints);
        setTrack(track);
      } else {
        const createTrack = kind === 'video' ? createLocalVideoTrack : createLocalAudioTrack;
        const newTrack = await createTrack(finalConstraints);
        setTrack(newTrack);
      }
    } catch (err) {
      onError?.(convertMediaError(err, permissionDeniedMessage, permissionDismissedMessage));
    }
  }, [onError, kind, permissionDeniedMessage, permissionDismissedMessage, deviceId, track, name]);

  const stop = useCallback(() => {
    track?.stop();
    setTrack(null);
  }, [track]);

  const mute = useCallback(() => {
    track?.disable();
  }, [track]);

  const unMute = useCallback(() => {
    track?.enable();
  }, [track]);

  // subscribe to track ending, and remove it.
  useEffect(() => {
    const handleStopped = () => setTrack(null);
    track?.on(MediaTrackEvent.Stopped, handleStopped);
    return () => {
      track?.off(MediaTrackEvent.Stopped, handleStopped);
    };
  }, [track]);

  // restart on device ID change
  useEffect(() => {
    if (!!track && getTrackDeviceId(track) !== deviceId) {
      start();
    }
  }, [deviceId, track, start]);

  return [track, { start, stop, mute, unMute }] as const;
}
