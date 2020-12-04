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

  useEffect(() => {
    if (!ref.current) return;
    // sanity check
    if (!isNaN(volume)) {
      ref.current.volume = volume;
    }
  }, [volume]);

  // if media is not ready yet (i.e. - if user has not interacted with the
  // page), don't mount the audio node
  if (!isReady) return null;

  return <audio ref={ref} id={id} />;
}
