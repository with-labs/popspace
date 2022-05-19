import { useMediaReadiness } from '@src/media/useMediaReadiness';
import React, { useEffect, useRef } from 'react';
import { SpatialAudio, SpatialAudioProps } from '../SpatialAudio/SpatialAudio';
import { attachTrack } from '@src/media/attachTrack';

interface AudioTrackProps extends SpatialAudioProps {
  track: MediaStreamTrack | null;
  id?: string;
}

export default function AudioTrack({ track, ...rest }: AudioTrackProps) {
  const ref = useRef<HTMLAudioElement>(null);

  const isReady = useMediaReadiness((s) => s.isReady);

  useEffect(() => {
    const el = ref.current;
    if (!isReady || !el || !track) return;
    if (typeof window === 'undefined') return;

    return attachTrack(el, track);
  }, [track, isReady]);

  return <SpatialAudio ref={ref} {...rest} />;
}
