import { TrackType } from './MediaProvider';

export interface PreferredDeviceStorage {
  setDeviceId: (trackType: TrackType, deviceId: string | null) => void;
  getDeviceId: (trackType: TrackType) => string | null;
}

export class LocalStoragePreferredDeviceStorage
  implements PreferredDeviceStorage
{
  constructor(private storageKey: string = 'preferredDeviceId') {}
  setDeviceId = (trackType: TrackType, deviceId: string | null) => {
    localStorage.setItem(`${this.storageKey}_${trackType}`, deviceId || '');
  };
  getDeviceId = (trackType: TrackType): string | null => {
    return localStorage.getItem(`${this.storageKey}_${trackType}`) || null;
  };
}
