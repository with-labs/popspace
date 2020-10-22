/**
 * #WITH_EDIT
 *
 * Aug 6, 2020 WQP
 * - Updated to latest starter app code
 * - Add local data track
 * - Video off by default
 * Aug 28, 2020 WQP
 * - Add error handler/message for failing to get the initial audio track.
 */
import { DEFAULT_VIDEO_CONSTRAINTS } from '../../../constants';
import { useCallback, useEffect, useState } from 'react';
import {
  LocalVideoTrack,
  LocalAudioTrack,
  CreateLocalTrackOptions,
  LocalDataTrack,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from 'twilio-video';

export default function useLocalTracks(onError: (err: Error) => void) {
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack>();
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [dataTrack, setDataTrack] = useState<LocalDataTrack>();
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false);

  /**
   * Creates a local audio track, optionally using the specified device.
   */
  const getLocalAudioTrack = useCallback(
    async (deviceId?: string) => {
      const options: CreateLocalTrackOptions = {};

      if (deviceId) {
        options.deviceId = { exact: deviceId };
      }

      try {
        return await createLocalAudioTrack(options).then((newTrack) => {
          setAudioTrack(newTrack);
          return newTrack;
        });
      } catch (err) {
        let newError: Error;
        if (err.message === 'Permission denied') {
          newError = new Error(
            'It looks like you have denied With access to your microphone. To share audio, you will need to let us use your microphone by updating permissions in your browser.'
          );
        } else if (err.message === 'Permission dismissed') {
          newError = new Error('Please grant microphone access to enable audio.');
        } else {
          newError = err;
        }
        onError(newError);
        throw err;
      }
    },
    [onError]
  );

  /**
   * Creates a local video track, optionally using the
   * specified device.
   */
  const getLocalVideoTrack = useCallback(
    async (newOptions?: CreateLocalTrackOptions) => {
      // In the DeviceSelector and FlipCameraButton components, a new video track is created,
      // then the old track is unpublished and the new track is published. Unpublishing the old
      // track and publishing the new track at the same time sometimes causes a conflict when the
      // track name is 'camera', so here we append a timestamp to the track name to avoid the
      // conflict.
      const options: CreateLocalTrackOptions = {
        ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
        name: `camera-${Date.now()}`,
        ...newOptions,
      };

      try {
        return await createLocalVideoTrack(options).then((newTrack) => {
          setVideoTrack(newTrack);
          return newTrack;
        });
      } catch (err) {
        let newError: Error;
        if (err.message === 'Permission denied') {
          newError = new Error(
            'It looks like you have denied With access to your camera. To share video, you will need to let us use your camera by updating permissions in your browser.'
          );
        } else if (err.message === 'Permission dismissed') {
          newError = new Error('Please grant camera access to enable video.');
        } else {
          newError = err;
        }
        onError(newError);
        throw err;
      }
    },
    [onError]
  );

  /**
   * Disables the local video track
   */
  const removeLocalVideoTrack = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(undefined);
    }
  }, [videoTrack]);

  // on startup, immediately get an audio track - this
  // is effectively turning the mic on by default.
  useEffect(() => {
    setIsAcquiringLocalTracks(true);
    getLocalAudioTrack()
      .catch(() => {
        // this error is logged in getLocalAudioTrack, just thrown
        // again so that other callers will see it
      })
      .finally(() => {
        setIsAcquiringLocalTracks(false);
      });
  }, [getLocalAudioTrack]);

  // Data tracks don't require browser permissions, so set that up independently of the AV tracks.
  useEffect(() => {
    setDataTrack(new LocalDataTrack());
  }, []);

  const localTracks = [audioTrack, videoTrack, dataTrack].filter((track) => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
    | LocalDataTrack
  )[];

  return { localTracks, getLocalVideoTrack, getLocalAudioTrack, isAcquiringLocalTracks, removeLocalVideoTrack };
}
