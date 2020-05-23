export function getMediaDevices() {
  if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    return navigator.mediaDevices.enumerateDevices().then(devices => {
      const cameras: MediaDeviceInfo[] = [];
      const mics: MediaDeviceInfo[] = [];
      const speakers: MediaDeviceInfo[] = [];

      devices.forEach(device => {
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
