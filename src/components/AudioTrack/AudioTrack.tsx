import React, { useEffect, useRef } from 'react';
import { AudioTrack as IAudioTrack } from 'twilio-video';

interface AudioTrackProps {
  track: IAudioTrack;
}

export default function AudioTrack({ track }: AudioTrackProps) {
  const ref = useRef<HTMLAudioElement>(null!);
  console.log('Volume: ', ref.current && ref.current.volume);
  console.log('Track: ', track);

  useEffect(() => {
    const el = ref.current;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  return <audio ref={ref} />;
}
