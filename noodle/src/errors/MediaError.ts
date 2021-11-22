import { ErrorTypes } from '@constants/ErrorTypes';

export enum MEDIA_STATUS {
  DENIED = 'DENIED',
  DISMISSED = 'DISMISSED',
  NO_SYSTEM_PERMISSIONS = 'NO_SYSTEM_PERMISSIONS',
}

export enum MEDIA_TYPES {
  VIDEO = 'video',
  AUDIO = 'audio',
  SCREEN_SHARE = 'screenShare',
  UNEXPECTED_MEDIA = 'unexpected_media',
}

export class MediaError extends Error {
  private _type: ErrorTypes;
  private _mediaType: MEDIA_TYPES;
  private _status: MEDIA_STATUS;

  constructor(message: string, mediaType: MEDIA_TYPES, status: MEDIA_STATUS) {
    super(message);
    this._type = ErrorTypes.MEDIA;
    this._mediaType = mediaType;
    this._status = status;
  }

  get type() {
    return this._type;
  }

  get mediaType() {
    return this._mediaType;
  }

  get status() {
    return this._status;
  }
}
