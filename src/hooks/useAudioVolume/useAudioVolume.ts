import { AudioTrack, AudioTrackPublication } from 'twilio-video';
import volumeMeter from 'volume-meter';
import { useState, useEffect } from 'react';
import useTrack from '../../providers/twilio/hooks/useTrack';
import useMediaStreamTrack from '../../providers/twilio/hooks/useMediaStreamTrack';
import throttle from 'lodash.throttle';

// Safari and old webkit compat
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export function useAudioVolume(
  /**
   * The audio track, local or remote, to monitor.
   */
  publication: AudioTrackPublication | undefined,
  /**
   * A callback for when the volume changes. WARNING: ensure this callback is stable
   * and doesn't set any React state - use springs instead. It will be invoked very frequently!
   */
  onVolumeChange: (volume: number) => any
) {
  const [ctx] = useState(() => new AudioContext());

  const mediaTrack = useTrack(publication) as AudioTrack;
  const mediaStreamTrack = useMediaStreamTrack(mediaTrack);

  useEffect(() => {
    if (!mediaStreamTrack) return;

    const stream = new MediaStream([mediaStreamTrack.clone()]);
    const src = ctx.createMediaStreamSource(stream);

    const meter = volumeMeter(ctx, { tweenIn: 2, tweenOut: 6 }, throttle(onVolumeChange, 50));

    src.connect(meter);

    return () => {
      src.disconnect(meter);
      meter.disconnect();
    };
  }, [mediaStreamTrack, ctx, onVolumeChange]);
}
