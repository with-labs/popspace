import { useState, useRef, useEffect, useCallback } from 'react';
import { LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';
import { logger } from '../../utils/logger';

/**
 * Manages toggle state for a local media track publication, along with busy
 * status to disable the toggle while the track publishes.
 */
export function useLocalMediaToggle(
  publication: LocalTrackPublication | RemoteTrackPublication | null,
  start: () => Promise<any>,
  stop: () => void
) {
  const [busy, setBusy] = useState(false);

  // prevent setting state on unmounted component.
  const stillMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      stillMountedRef.current = false;
    };
  }, []);

  // a fallback timer in case the publication never publishes
  const startBusyTimeout = useCallback(() => {
    setTimeout(() => {
      if (stillMountedRef.current) {
        setBusy(false);
      }
    }, 2000);
  }, []);

  // reset busy when the publication changes (publishes / unpublishes)
  useEffect(() => {
    setBusy(false);
  }, [publication]);

  // throttled to prevent rapid on/off toggling - wait a moment for the
  // stream to start.
  const toggleAudioEnabled = useCallback(async () => {
    setBusy(true);
    // start a failsafe, in case the track never publishes, to enable the toggle again anyway.
    startBusyTimeout();

    try {
      if (publication) {
        stop();
      } else {
        await start();
      }
    } catch (err) {
      logger.error(err);
    }
  }, [publication, start, stop, startBusyTimeout]);

  return [!!publication, toggleAudioEnabled, busy] as const;
}
