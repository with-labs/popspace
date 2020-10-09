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
import Video, { LocalVideoTrack, LocalAudioTrack, CreateLocalTrackOptions, LocalDataTrack } from 'twilio-video';

import { ErrorCallback } from '../../../types/twilio';

export default function useLocalTracks(onError: ErrorCallback) {
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack>();
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [dataTrack, setDataTrack] = useState<LocalDataTrack>();
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false);

  const getLocalAudioTrack = useCallback((deviceId?: string) => {
    const options: CreateLocalTrackOptions = {};

    if (deviceId) {
      options.deviceId = { exact: deviceId };
    }

    return Video.createLocalAudioTrack(options).then((newTrack) => {
      setAudioTrack(newTrack);
      return newTrack;
    });
  }, []);

  const getLocalVideoTrack = useCallback((newOptions?: CreateLocalTrackOptions) => {
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

    return Video.createLocalVideoTrack(options).then((newTrack) => {
      setVideoTrack(newTrack);
      return newTrack;
    });
  }, []);

  const removeLocalVideoTrack = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(undefined);
    }
  }, [videoTrack]);

  useEffect(() => {
    setIsAcquiringLocalTracks(true);
    Video.createLocalTracks({
      // Uncomment to make video on by default.
      // video: {
      //   ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
      //   name: `camera-${Date.now()}`,
      // },
      audio: true,
    })
      .then((tracks) => {
        const videoTrack = tracks.find((track) => track.kind === 'video');
        const audioTrack = tracks.find((track) => track.kind === 'audio');
        if (videoTrack) {
          setVideoTrack(videoTrack as LocalVideoTrack);
        }
        if (audioTrack) {
          setAudioTrack(audioTrack as LocalAudioTrack);
        }
      })
      .catch((err) => {
        const msg =
          // Currently only attempting to connect audio by default, so let the messaging reflect that.
          // May need to update the error string if we decide to enable video by default later on.
          err.message === 'Permission denied' || 'Permission dismissed'
            ? 'We were unable to connect to your microphone. Please grant microphone access to enable audio.'
            : 'Something went wrong connecting to your microphone or camera. Please grant access to those devices to enable audio and video.';
        // @ts-ignore Only an error is required
        onError(new Error(msg));
      })
      .finally(() => setIsAcquiringLocalTracks(false));
  }, []);

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
