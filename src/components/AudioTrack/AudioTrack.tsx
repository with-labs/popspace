import React, { useEffect, useRef, useContext } from 'react';
import { AudioTrack as IAudioTrack } from 'twilio-video';
import { MediaReadinessContext } from '../MediaReadinessProvider/MediaReadinessProvider';

interface AudioTrackProps {
  track: IAudioTrack;
  volume: number;
  id?: string;
}

export default function AudioTrack({ track, volume, id }: AudioTrackProps) {
  const ref = useRef<HTMLAudioElement>(null!);

  const { isReady } = useContext(MediaReadinessContext);

  useEffect(() => {
    const el = ref.current;
    if (!isReady || !el) return;

    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track, isReady]);

  // sets the volume on change. needs to rely on isReady so that it will
  // be run again when isReady = true and the audio node is mounted.
  useEffect(() => {
    if (!ref.current || !isReady) return;
    // sanity check
    if (!isNaN(volume)) {
      ref.current.volume = volume;
    }
  }, [volume, isReady]);

  // if media is not ready yet (i.e. - if user has not interacted with the
  // page), don't mount the audio node
  if (!isReady) return null;

  return <audio ref={ref} id={id} />;
}
