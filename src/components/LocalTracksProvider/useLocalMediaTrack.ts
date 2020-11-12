import { useCallback, useState, useEffect, useRef } from 'react';

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
  deviceId: string | null,
  constraints: MediaTrackConstraints,
  {
    onError,
    permissionDeniedMessage,
    permissionDismissedMessage,
  }: {
    onError?: (err: Error) => void;
    permissionDeniedMessage?: string;
    permissionDismissedMessage?: string;
  }
) {
  // capture this to avoid re-rendering on changes.
  const constraintsRef = useRef(constraints);
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);

  const start = useCallback(async () => {
    const finalConstraints = {
      ...constraintsRef.current,
      deviceId,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        [kind]: finalConstraints,
      });
      const newTrack = stream.getTracks().find((t) => t.kind === kind) ?? null;
      setTrack(newTrack);
    } catch (err) {
      if (permissionDeniedMessage && err.message === 'Permission denied') {
        onError?.(new Error(permissionDeniedMessage));
      } else if (permissionDismissedMessage && err.message === 'Permission dismissed') {
        onError?.(new Error(permissionDismissedMessage));
      } else {
        onError?.(err);
      }
    }
  }, [onError, kind, permissionDeniedMessage, permissionDismissedMessage, deviceId]);

  // stops tracks after they are superseded
  useEffect(() => {
    return () => {
      track?.stop();
    };
  }, [track]);

  const stop = useCallback(() => {
    track?.stop();
    setTrack(null);
  }, [track]);

  // subscribe to track ending, and remove it.
  useEffect(() => {
    const handleStopped = () => setTrack(null);
    track?.addEventListener('ended', handleStopped);
    return () => {
      track?.removeEventListener('ended', handleStopped);
    };
  }, [track]);

  // restart on device ID change
  useEffect(() => {
    if (!!track && (track.getConstraints().deviceId ?? null) !== deviceId) {
      start();
    }
  }, [deviceId, track, start]);

  return [track, start, stop] as const;
}
