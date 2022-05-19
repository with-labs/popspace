import useMergedRef from '@react-hook/merged-ref';
import * as React from 'react';
import { useSpatialAudioVolume } from '@hooks/useSpatialAudioVolume/useSpatialAudioVolume';
import { CanvasObjectKind } from '@providers/canvas/Canvas';
import { useMediaReadiness } from '@src/media/useMediaReadiness';

export interface SpatialAudioProps
  extends Omit<React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>, 'ref'> {
  /**
   * The room object (widget or user) this media source is
   * associated with
   */
  objectId: string | null;
  /**
   * The kind of room object ('widget' or 'user') this media source
   * is associated with
   */
  objectKind: CanvasObjectKind;
  /**
   * Allows control of whether spatial volume is applied
   */
  disableSpatialAudio?: boolean;
  /** Whether to begin playing as soon as the element mounts */
  autoPlay?: boolean;
  src?: string;
}

/**
 * Wraps an <audio /> tag with volume control from spatial audio
 */
export const SpatialAudio = React.forwardRef<HTMLAudioElement, SpatialAudioProps>(
  ({ objectId, objectKind, disableSpatialAudio, ...rest }, ref) => {
    const internalRef = React.useRef<HTMLAudioElement>();

    const lastVolumeRef = useSpatialAudioVolume((vol) => {
      if (internalRef.current && !disableSpatialAudio) internalRef.current.volume = vol;
    });

    // for autoPlay elements, we wait until user has interacted so
    // that media playback is successful.
    const isReady = useMediaReadiness((s) => s.isReady);
    const canMount = !rest.autoPlay || isReady;

    // because the element doesn't have a volume attribute, to ensure we get the right
    // initial volume we trigger an effect when the element mounts.
    React.useEffect(() => {
      if (canMount && internalRef.current) {
        if (disableSpatialAudio) {
          internalRef.current.volume = 1;
        } else {
          internalRef.current.volume = lastVolumeRef.current;
        }
      }
    }, [canMount, internalRef, lastVolumeRef, disableSpatialAudio]);

    const finalRef = useMergedRef(internalRef, ref);

    if (rest.autoPlay && !isReady) return null;

    return <audio ref={finalRef} {...rest} />;
  }
);
