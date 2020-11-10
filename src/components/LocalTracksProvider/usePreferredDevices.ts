import { useState, useCallback } from 'react';
import Cookie from 'js-cookie';
import { CAMERA_DEVICE_COOKIE, MIC_DEVICE_COOKIE } from '../../constants/User';

export function usePreferredDevices() {
  const [cameraDeviceId, setCameraDeviceIdInternal] = useState(() => {
    return Cookie.get(CAMERA_DEVICE_COOKIE) || null;
  });
  const [micDeviceId, setMicDeviceIdInternal] = useState(() => {
    return Cookie.get(MIC_DEVICE_COOKIE) || null;
  });

  const setCameraDeviceId = useCallback((deviceId: string | null) => {
    if (deviceId) {
      Cookie.set(CAMERA_DEVICE_COOKIE, deviceId);
    } else {
      Cookie.remove(CAMERA_DEVICE_COOKIE);
    }
    setCameraDeviceIdInternal(deviceId);
  }, []);

  const setMicDeviceId = useCallback((deviceId: string | null) => {
    if (deviceId) {
      Cookie.set(MIC_DEVICE_COOKIE, deviceId);
    } else {
      Cookie.remove(MIC_DEVICE_COOKIE);
    }
    setMicDeviceIdInternal(deviceId);
  }, []);

  return {
    cameraDeviceId,
    micDeviceId,
    setCameraDeviceId,
    setMicDeviceId,
  };
}
