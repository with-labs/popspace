import { AudioTrack, AudioTrackPublication } from 'twilio-video';
import volumeMeter from 'volume-meter';
import { useState, useEffect } from 'react';
import useTrack from '../../hooks/useTrack/useTrack';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';

export function useAudioVolume(
  publication: AudioTrackPublication | undefined,
  onVolumeChange: (volume: number) => any
) {
  const [ctx] = useState(() => new AudioContext());

  const mediaTrack = useTrack(publication) as AudioTrack;
  const mediaStreamTrack = useMediaStreamTrack(mediaTrack);

  useEffect(() => {
    if (!mediaStreamTrack) return;

    const stream = new MediaStream([mediaStreamTrack.clone()]);
    const src = ctx.createMediaStreamSource(stream);

    const meter = volumeMeter(ctx, { tweenIn: 2, tweenOut: 6 }, onVolumeChange);

    src.connect(meter);

    return () => {
      src.disconnect(meter);
      meter.disconnect();
    };
  }, [mediaStreamTrack, ctx, onVolumeChange]);
}
