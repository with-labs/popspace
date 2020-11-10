import { useState, useMemo } from 'react';
import { LocalDataTrack } from 'twilio-video';
import { useLocalMediaTrack } from './useLocalMediaTrack';
import { useScreenShareTracks } from './useScreenShareTracks';
import { DEFAULT_VIDEO_CONSTRAINTS } from '../../constants';
import { usePreferredDevices } from './usePreferredDevices';

/**
 * Each user can have exactly one of each kind of track:
 * - Video
 * - Audio (mic)
 * - ScreenShare Video
 * - ScreenShare Audio
 * - Data
 *
 * This hook manages the state of these tracks and provides a consistent API for how the app
 * can interact with them:
 *
 * - Start Track: Starts or restarts the track (optionally with new constraints)
 * - Stop Track: Stops any existing track
 *
 */
export function useLocalTracksState(onError: (err: Error) => void) {
  const { cameraDeviceId, micDeviceId, setCameraDeviceId, setMicDeviceId } = usePreferredDevices();

  const [audioTrack, startAudio, stopAudio] = useLocalMediaTrack(
    'audio',
    micDeviceId,
    {},
    {
      onError,
    }
  );
  const [videoTrack, startVideo, stopVideo] = useLocalMediaTrack('video', cameraDeviceId, DEFAULT_VIDEO_CONSTRAINTS, {
    onError,
  });
  const [{ screenShareVideoTrack, screenShareAudioTrack }, startScreenShare, stopScreenShare] = useScreenShareTracks({
    onError,
  });
  // there's never really any reason to change this track. It's always there and active.
  const [dataTrack] = useState<LocalDataTrack>(() => new LocalDataTrack());

  return useMemo(
    () => ({
      audioTrack,
      startAudio,
      stopAudio,
      videoTrack,
      startVideo,
      stopVideo,
      screenShareVideoTrack,
      screenShareAudioTrack,
      startScreenShare,
      stopScreenShare,
      dataTrack,
      setCameraDeviceId,
      setMicDeviceId,
      cameraDeviceId,
      micDeviceId,
    }),
    [
      audioTrack,
      dataTrack,
      screenShareAudioTrack,
      screenShareVideoTrack,
      setCameraDeviceId,
      setMicDeviceId,
      startAudio,
      startScreenShare,
      startVideo,
      stopAudio,
      stopScreenShare,
      stopVideo,
      videoTrack,
      cameraDeviceId,
      micDeviceId,
    ]
  );
}
