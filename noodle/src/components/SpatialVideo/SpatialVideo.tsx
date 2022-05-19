import useMergedRef from '@react-hook/merged-ref';
import * as React from 'react';
import { useSpatialAudioVolume } from '@hooks/useSpatialAudioVolume/useSpatialAudioVolume';
import { useMediaReadiness } from '@src/media/useMediaReadiness';

export interface SpatialVideoProps
  extends Omit<React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, 'ref'> {
  /**
   * The room object (widget or user) this media source is
   * associated with
   */
  objectId: string;
  /**
   * The kind of room object ('widget' or 'user') this media source
   * is associated with
   */
  objectKind: 'widget' | 'user';
  /**
   * Allows control of whether spatial volume is applied
   */
  disableSpatialVideo?: boolean;
  /** Whether to begin playing as soon as the element mounts */
  autoPlay?: boolean;
}

/**
 * Wraps an <audio /> tag with volume control from spatial audio
 */
export const SpatialVideo = React.forwardRef<HTMLVideoElement, SpatialVideoProps>(
  ({ objectId, objectKind, disableSpatialVideo, ...rest }, ref) => {
    const internalRef = React.useRef<HTMLVideoElement>();

    const lastVolumeRef = useSpatialAudioVolume((vol) => {
      if (internalRef.current) internalRef.current.volume = vol;
    });

    // for autoPlay elements, we wait until user has interacted so
    // that media playback is successful.
    const isReady = useMediaReadiness((s) => s.isReady);
    const canMount = !rest.autoPlay || isReady;

    // because the element doesn't have a volume attribute, to ensure we get the right
    // initial volume we trigger an effect when the element mounts.
    React.useEffect(() => {
      if (canMount && internalRef.current) {
        internalRef.current.volume = lastVolumeRef.current;
      }
    }, [canMount, internalRef, lastVolumeRef]);

    const finalRef = useMergedRef(internalRef, ref);

    if (rest.autoPlay && !isReady) return null;

    return <video ref={finalRef} {...rest} />;
  }
);
