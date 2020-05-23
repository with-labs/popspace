import { useCallback, useState, useEffect } from 'react';

import { getMediaDevices } from '../../utils/mediaSources';

export function useAVSources() {
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], mics: [], speakers: [] });

  const updateDevices = useCallback(() => {
    getMediaDevices().then(mediaDevices => {
      setDevices(mediaDevices);
    });
  }, []);

  useEffect(() => {
    // Get the initial set of devices and set them in state.
    updateDevices();

    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = updateDevices;
    }

    return () => {
      if (navigator && navigator.mediaDevices && navigator.mediaDevices.ondevicechange === updateDevices) {
        navigator.mediaDevices.ondevicechange = () => null;
      }
    };
  }, []); // Only run effect once. This populates the initial set of devices and sets up the ondevicechange callback.

  return devices;
}
