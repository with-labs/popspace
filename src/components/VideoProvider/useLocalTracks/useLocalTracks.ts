/**
 * #WITH_EDIT
 *
 * Aug 6, 2020 WQP
 * - Updated to latest starter app code
 * - Add local data track
 * - Video off by default
 */
import { DEFAULT_VIDEO_CONSTRAINTS } from '../../../constants';
import { useCallback, useEffect, useState } from 'react';
import Video, { LocalVideoTrack, LocalAudioTrack, CreateLocalTrackOptions, LocalDataTrack } from 'twilio-video';

export default function useLocalTracks() {
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack>();
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [dataTrack, setDataTrack] = useState<LocalDataTrack>();
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false);

  const getLocalAudioTrack = useCallback((deviceId?: string) => {
    const options: CreateLocalTrackOptions = {};

    if (deviceId) {
      options.deviceId = { exact: deviceId };
    }

    return Video.createLocalAudioTrack(options).then(newTrack => {
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

    return Video.createLocalVideoTrack(options).then(newTrack => {
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
      .then(tracks => {
        const videoTrack = tracks.find(track => track.kind === 'video');
        const audioTrack = tracks.find(track => track.kind === 'audio');
        if (videoTrack) {
          setVideoTrack(videoTrack as LocalVideoTrack);
        }
        if (audioTrack) {
          setAudioTrack(audioTrack as LocalAudioTrack);
        }

        setDataTrack(new LocalDataTrack());
      })
      .finally(() => setIsAcquiringLocalTracks(false));
  }, []);

  const localTracks = [audioTrack, videoTrack, dataTrack].filter(track => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
    | LocalDataTrack
  )[];

  return { localTracks, getLocalVideoTrack, getLocalAudioTrack, isAcquiringLocalTracks, removeLocalVideoTrack };
}
