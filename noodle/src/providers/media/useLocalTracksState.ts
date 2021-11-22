import { useState, useMemo, useCallback } from 'react';
import { LocalDataTrack } from 'twilio-video';
import { useLocalMediaTrack } from './useLocalMediaTrack';
import { useScreenShareTracks } from './useScreenShareTracks';
import { DEFAULT_VIDEO_CONSTRAINTS } from '../../constants';
import { usePreferredDevices } from './usePreferredDevices';
import { useTranslation } from 'react-i18next';
import {
  MIC_TRACK_NAME,
  CAMERA_TRACK_NAME,
  SCREEN_SHARE_TRACK_NAME,
  SCREEN_SHARE_AUDIO_TRACK_NAME,
} from '@constants/User';

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
  const { t } = useTranslation();
  const { cameraDeviceId, micDeviceId, setCameraDeviceId, setMicDeviceId } = usePreferredDevices();

  const [audioTrack, { start: startAudio, stop: stopAudio, restart: restartAudio }] = useLocalMediaTrack(
    'audio',
    MIC_TRACK_NAME,
    micDeviceId,
    {},
    {
      onError,
      permissionDismissedMessage: t('error.media.audioPermissionDismissed'),
      permissionDeniedMessage: t('error.media.audioPermissionDenied'),
    }
  );
  const [videoTrack, { start: startVideo, stop: stopVideo, restart: restartVideo }] = useLocalMediaTrack(
    'video',
    CAMERA_TRACK_NAME,
    cameraDeviceId,
    DEFAULT_VIDEO_CONSTRAINTS,
    {
      onError,
      permissionDismissedMessage: t('error.media.videoPermissionDismissed'),
      permissionDeniedMessage: t('error.media.videoPermissionDenied'),
    }
  );
  const [
    { screenShareVideoTrack, screenShareAudioTrack },
    { start: startScreenShare, stop: stopScreenShare, restart: restartScreenShare },
  ] = useScreenShareTracks({
    onError,
    // unlike the others, the screen share dialog currently reports "Cancel" as "Denied" not "Dismissed", so
    // we keep using the dismissed language.
    permissionDismissedMessage: t('error.media.screenSharePermissionDismissed'),
    permissionDeniedMessage: t('error.media.screenSharePermissionDismissed'),
    videoName: SCREEN_SHARE_TRACK_NAME,
    audioName: SCREEN_SHARE_AUDIO_TRACK_NAME,
  });

  const [dataTrack, setDataTrack] = useState<LocalDataTrack>(() => new LocalDataTrack());
  const restartData = useCallback(() => {
    setDataTrack(new LocalDataTrack());
  }, []);

  const stopAll = useCallback(() => {
    stopAudio();
    stopVideo();
    stopScreenShare();
  }, [stopAudio, stopScreenShare, stopVideo]);

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
      restartAudio,
      restartVideo,
      restartScreenShare,
      restartData,
      stopAll,
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
      restartAudio,
      restartVideo,
      restartScreenShare,
      restartData,
      stopAll,
    ]
  );
}
