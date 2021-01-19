import React, { useEffect, useRef, useContext } from 'react';
import { AudioTrack as IAudioTrack } from 'twilio-video';
import { MediaReadinessContext } from '../MediaReadinessProvider/MediaReadinessProvider';
import { SpatialAudio, SpatialAudioProps } from '../SpatialAudio/SpatialAudio';

interface AudioTrackProps extends SpatialAudioProps {
  track: IAudioTrack;
  id?: string;
}

export default function AudioTrack({ track, ...rest }: AudioTrackProps) {
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

  return <SpatialAudio ref={ref} {...rest} />;
}
