export function getMediaDevices() {
  if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    return navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras: MediaDeviceInfo[] = [];
      const mics: MediaDeviceInfo[] = [];
      const speakers: MediaDeviceInfo[] = [];

      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          cameras.push(device);
        } else if (device.kind === 'audioinput') {
          mics.push(device);
        } else if (device.kind === 'audiooutput') {
          speakers.push(device);
        }
      });

      return { cameras, mics, speakers };
    });
  } else {
    return Promise.resolve({ cameras: [], mics: [], speakers: [] });
  }
}

/**
 * NOTE: This is borrowed from the starter app.
 *
 * This function ensures that the user has granted the browser permission to use audio and video
 * devices. If permission has not been granted, it will cause the browser to ask for permission
 * for audio and video at the same time (as opposed to separate requests).
 */
export function ensureMediaPermissions() {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => devices.every((device) => !(device.deviceId && device.label)))
    .then((shouldAskForMediaPermissions) => {
      if (shouldAskForMediaPermissions) {
        return navigator.mediaDevices
          .getUserMedia({ audio: true, video: true })
          .then((mediaStream) => mediaStream.getTracks().forEach((track) => track.stop()));
      }
    });
}
