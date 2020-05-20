/**
 * #ANGLES_EDIT
 *
 * 3/1/2020 WQP: Now creates a LocalDataTrack for the local participant in addition to audio and video tracks.
 * The created LocalDataTrack is included in the `localTracks` property returned.
 *
 * 4/23/2020 WQP: Removed the useEffect call that automatically creates a video track when the app loads.
 *
 * 5/18/2020 WQP: Add device id param to getLocalVideoTrack to allow specifying the video input.
 *                Add `getLocalAudioTrack` to exports to allow specifying the audio input.
 */

import { useCallback, useEffect, useState } from 'react';
import Video, { LocalVideoTrack, LocalAudioTrack, LocalDataTrack, CreateLocalTrackOptions } from 'twilio-video';

export function useLocalAudioTrack() {
  const [track, setTrack] = useState<LocalAudioTrack>();

  const getLocalAudioTrack = useCallback((deviceId?: string) => {
    const trackOpts: CreateLocalTrackOptions = {};
    if (deviceId) {
      trackOpts.deviceId = { exact: deviceId };
    }

    return Video.createLocalAudioTrack(trackOpts).then(newTrack => {
      setTrack(newTrack);
      return newTrack;
    });
  }, []);

  useEffect(() => {
    Video.createLocalAudioTrack().then(newTrack => {
      getLocalAudioTrack();
      setTrack(newTrack);
    });
  }, [getLocalAudioTrack]);

  useEffect(() => {
    const handleStopped = () => setTrack(undefined);
    if (track) {
      track.on('stopped', handleStopped);
      return () => {
        track.off('stopped', handleStopped);
      };
    }
  }, [track]);

  return [track, getLocalAudioTrack] as const;
}

export function useLocalDataTrack() {
  const [track, setTrack] = useState<LocalDataTrack>();

  useEffect(() => {
    // Not sure if this is the right way to create a data track?
    // The docs had some weird Promise stuff going on. https://www.twilio.com/docs/video/using-datatrack-api
    setTrack(new LocalDataTrack());
  }, []);

  // LocalDataTracks don't seem to emit any events. So no need to handle stopping, etc...

  return track;
}

export function useLocalVideoTrack() {
  const [track, setTrack] = useState<LocalVideoTrack>();

  // Device id is optional to allow specifying which video input to use.
  const getLocalVideoTrack = useCallback((deviceId?: string) => {
    const trackOpts: CreateLocalTrackOptions = {
      frameRate: 24,
      height: 720,
      width: 1280,
      name: 'camera',
    };
    // Add the device id for the video, if specified.
    if (deviceId) {
      trackOpts.deviceId = { exact: deviceId };
    }
    return Video.createLocalVideoTrack(trackOpts).then(newTrack => {
      setTrack(newTrack);
      return newTrack;
    });
  }, []);

  // Uncomment this to re-enable video-on by default.
  // useEffect(() => {
  //   // We get a new local video track when the app loads.
  //   getLocalVideoTrack();
  // }, [getLocalVideoTrack]);

  useEffect(() => {
    const handleStopped = () => {
      setTrack(undefined);
    };
    if (track) {
      track.on('stopped', handleStopped);
      return () => {
        track.off('stopped', handleStopped);
      };
    }
  }, [track]);

  return [track, getLocalVideoTrack] as const;
}

export default function useLocalTracks() {
  const [audioTrack, getLocalAudioTrack] = useLocalAudioTrack();
  const [videoTrack, getLocalVideoTrack] = useLocalVideoTrack();
  const dataTrack = useLocalDataTrack();

  const localTracks = [audioTrack, videoTrack, dataTrack].filter(track => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
    | LocalDataTrack
  )[];

  return { localTracks, getLocalVideoTrack, getLocalAudioTrack };
}
