import { useState, useCallback, useEffect } from 'react';
import { convertMediaError } from './convertMediaError';
import { LocalVideoTrack, LocalAudioTrack } from 'twilio-video';
import { MediaTrackEvent } from '@constants/twilio';
import { createTrackName } from '@utils/trackNames';
import { MEDIA_TYPES } from '../../errors/MediaError';

export function useScreenShareTracks({
  onError,
  permissionDeniedMessage,
  permissionDismissedMessage,
  videoName,
  audioName,
}: {
  onError?: (err: Error) => void;
  permissionDeniedMessage?: string;
  permissionDismissedMessage?: string;
  videoName: string;
  audioName: string;
}) {
  const [{ screenShareVideoTrack, screenShareAudioTrack }, setTracks] = useState<{
    screenShareVideoTrack: LocalVideoTrack | null;
    screenShareAudioTrack: LocalAudioTrack | null;
  }>({
    screenShareAudioTrack: null,
    screenShareVideoTrack: null,
  });

  const start = useCallback(async () => {
    const constraints: MediaStreamConstraints = {
      video: {
        frameRate: 10,
        height: 1080,
        width: 1920,
      },
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

      // Twilio doesn't support video+audio tracks from the same source, so we have to create them manually.

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      const videoTrack = stream.getVideoTracks()[0] ?? null;
      const audioTrack = stream.getAudioTracks()[0] ?? null;

      const twilioVideoTrack =
        videoTrack &&
        new LocalVideoTrack(videoTrack, {
          name: createTrackName(videoName),
          logLevel: 'off',
        });
      const twilioAudioTrack =
        audioTrack &&
        new LocalAudioTrack(audioTrack, {
          name: createTrackName(audioName),
          logLevel: 'off',
        });

      setTracks({
        screenShareVideoTrack: twilioVideoTrack,
        screenShareAudioTrack: twilioAudioTrack,
      });
    } catch (err) {
      onError?.(convertMediaError(err, MEDIA_TYPES.SCREEN_SHARE, permissionDeniedMessage, permissionDismissedMessage));
    }
  }, [
    onError,
    permissionDeniedMessage,
    permissionDismissedMessage,
    screenShareAudioTrack,
    screenShareVideoTrack,
    audioName,
    videoName,
  ]);

  const stop = useCallback(() => {
    screenShareAudioTrack?.stop();
    screenShareVideoTrack?.stop();
    setTracks({
      screenShareAudioTrack: null,
      screenShareVideoTrack: null,
    });
  }, [screenShareAudioTrack, screenShareVideoTrack]);

  const restart = useCallback(() => {
    stop();
    return start();
  }, [stop, start]);

  // end listener for video
  useEffect(() => {
    const handleStopped = () =>
      setTracks((cur) => ({
        screenShareVideoTrack: null,
        screenShareAudioTrack: cur.screenShareAudioTrack,
      }));
    screenShareVideoTrack?.on(MediaTrackEvent.Stopped, handleStopped);
    return () => {
      screenShareVideoTrack?.off(MediaTrackEvent.Stopped, handleStopped);
    };
  }, [screenShareVideoTrack]);

  // end listener for audio
  useEffect(() => {
    const handleStopped = () =>
      setTracks((cur) => ({
        screenShareVideoTrack: cur.screenShareVideoTrack,
        screenShareAudioTrack: null,
      }));
    screenShareAudioTrack?.on(MediaTrackEvent.Stopped, handleStopped);
    return () => {
      screenShareAudioTrack?.off(MediaTrackEvent.Stopped, handleStopped);
    };
  }, [screenShareAudioTrack]);

  return [
    {
      screenShareVideoTrack,
      screenShareAudioTrack,
    },
    { start, stop, restart },
  ] as const;
}
