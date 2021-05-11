import { useCallback, useState, useEffect } from 'react';
import { useLocalTracks } from '../../providers/media/hooks/useLocalTracks';

import { getMediaDevices } from '../../utils/mediaSources';

export function useAVSources() {
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
    initialized: boolean;
  }>({ cameras: [], mics: [], speakers: [], initialized: false });

  const localTracks = useLocalTracks();

  const updateDevices = useCallback(() => {
    getMediaDevices().then((mediaDevices) => {
      setDevices({
        ...mediaDevices,
        initialized: true,
      });
    });
  }, []);

  useEffect(() => {
    // Get the initial set of devices and set them in state.
    updateDevices();

    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', updateDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
      };
    }
  }, [updateDevices]);

  // Effect to update device listings when the local tracks change. This is intended to cover the case where the user
  // has not yet granted permission to a audio/video resource, then attempts to enable that resource once already in the
  // room. Consider the following scenario.....
  // 1. User enters room without camera enabled.
  // 2. User opens their settings. At this point their camera options drop down should be empty (because no permission
  //    granted yet).
  // 3. User enables their camera.
  // 4. Browser asks them if they'd like to allow access to the camera via permission dialog.
  // 5. They grant permission via the browser's permission dialog.
  // 6. The Twilio sdk captures the camera video stream and publishes the video track.
  // 7. This effect will see the update to the local tracks and requery the media devices, updating the listings
  //    provided by this custom hook.
  //
  // The caveat here is that we may query the device listings more often than they change, or more often than av source
  // permissions change. That is OK, because the alternate option of watching browser permissions via the Permissions
  // API is still unappealing due to the Permissions API's experimental and incomplete browser support.
  useEffect(() => {
    updateDevices();
  }, [localTracks, updateDevices]);

  return devices;
}
