import { useState, useCallback, useEffect } from 'react';

export function useScreenShareTracks({
  onError,
  permissionDeniedMessage,
  permissionDismissedMessage,
}: {
  onError?: (err: Error) => void;
  permissionDeniedMessage?: string;
  permissionDismissedMessage?: string;
}) {
  const [{ screenShareVideoTrack, screenShareAudioTrack }, setTracks] = useState<{
    screenShareVideoTrack: MediaStreamTrack | null;
    screenShareAudioTrack: MediaStreamTrack | null;
  }>({
    screenShareAudioTrack: null,
    screenShareVideoTrack: null,
  });

  const start = useCallback(async () => {
    const constraints = {
      video: true,
      audio: {
        channelCount: 2,
        // echo cancellation doesn't make sense for desktop audio
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        // @ts-ignore
        googEchoCancellation: false,
        // @ts-ignore
        googNoiseSuppression: false,
        // @ts-ignore
        googAutoGainControl: false,
      },
    };

    try {
      if (screenShareAudioTrack) {
        screenShareAudioTrack.stop();
      }
      if (screenShareVideoTrack) {
        screenShareVideoTrack.stop();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      const videoTrack = stream.getVideoTracks()[0] ?? null;
      const audioTrack = stream.getAudioTracks()[0] ?? null;

      setTracks({
        screenShareVideoTrack: videoTrack,
        screenShareAudioTrack: audioTrack,
      });
    } catch (err) {
      if (permissionDeniedMessage && err.message === 'Permission denied') {
        onError?.(new Error(permissionDeniedMessage));
      } else if (permissionDismissedMessage && err.message === 'Permission dismissed') {
        onError?.(new Error(permissionDismissedMessage));
      } else {
        onError?.(err);
      }
    }
  }, [onError, permissionDeniedMessage, permissionDismissedMessage, screenShareAudioTrack, screenShareVideoTrack]);

  const stop = useCallback(() => {
    screenShareAudioTrack?.stop();
    screenShareVideoTrack?.stop();
    setTracks({
      screenShareAudioTrack: null,
      screenShareVideoTrack: null,
    });
  }, [screenShareAudioTrack, screenShareVideoTrack]);

  // end listener for video
  useEffect(() => {
    const handleStopped = () =>
      setTracks((cur) => ({
        screenShareVideoTrack: null,
        screenShareAudioTrack: cur.screenShareAudioTrack,
      }));
    screenShareVideoTrack?.addEventListener('ended', handleStopped);
    return () => {
      screenShareVideoTrack?.removeEventListener('ended', handleStopped);
    };
  }, [screenShareVideoTrack]);

  // end listener for audio
  useEffect(() => {
    const handleStopped = () =>
      setTracks((cur) => ({
        screenShareVideoTrack: cur.screenShareVideoTrack,
        screenShareAudioTrack: null,
      }));
    screenShareAudioTrack?.addEventListener('ended', handleStopped);
    return () => {
      screenShareAudioTrack?.removeEventListener('ended', handleStopped);
    };
  }, [screenShareAudioTrack]);

  return [
    {
      screenShareVideoTrack,
      screenShareAudioTrack,
    },
    start,
    stop,
  ] as const;
}
