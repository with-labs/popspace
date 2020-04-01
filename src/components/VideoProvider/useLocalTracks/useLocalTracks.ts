/**
 * #ANGLES_EDIT
 *
 * Now creates a LocalDataTrack for the local participant in addition to audio and video tracks.
 * The created LocalDataTrack is included in the `localTracks` property returned.
 */

import { useCallback, useEffect, useState } from 'react';
import Video, { LocalVideoTrack, LocalAudioTrack, LocalDataTrack } from 'twilio-video';

export function useLocalAudioTrack() {
  const [track, setTrack] = useState<LocalAudioTrack>();

  useEffect(() => {
    Video.createLocalAudioTrack().then(newTrack => {
      setTrack(newTrack);
    });
  }, []);

  useEffect(() => {
    const handleStopped = () => setTrack(undefined);
    if (track) {
      track.on('stopped', handleStopped);
      return () => {
        track.off('stopped', handleStopped);
      };
    }
  }, [track]);

  return track;
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

  const getLocalVideoTrack = useCallback(
    () =>
      Video.createLocalVideoTrack({
        frameRate: 24,
        height: 720,
        width: 1280,
        name: 'camera',
      }).then(newTrack => {
        setTrack(newTrack);
        return newTrack;
      }),
    []
  );

  useEffect(() => {
    // We get a new local video track when the app loads.
    getLocalVideoTrack();
  }, [getLocalVideoTrack]);

  useEffect(() => {
    const handleStopped = () => setTrack(undefined);
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
  const audioTrack = useLocalAudioTrack();
  const [videoTrack, getLocalVideoTrack] = useLocalVideoTrack();
  const dataTrack = useLocalDataTrack();

  const localTracks = [audioTrack, videoTrack, dataTrack].filter(track => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
    | LocalDataTrack
  )[];

  return { localTracks, getLocalVideoTrack };
}
