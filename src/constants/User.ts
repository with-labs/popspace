// file used to track string contants used for the user and things related to the user

// the name of the session token in local storage
export const USER_SESSION_TOKEN = '__session_token';
export const USER_ONBOARDING = '__onboarding';
export const APP_VERSION = '__appVersion';

export const USER_SUPPORT_EMAIL = 'support@with.so';

export const CAMERA_DEVICE_COOKIE = 'cameraId';
export const MIC_DEVICE_COOKIE = 'micId';

// WARNING: it's important that these track names - which are really prefixes -
// not ever fully start with a different name. For example, we had a bug with
// screen share because the video track name was "screen" and the audio was "screen-audio"
// but because "screen-audio" begins with "screen", it was sometimes falsely reported
// as the video track (because .startsWith("screen") matches "screen-audio-12345")
// Just make sure these are exclusive and unique from one another!
export const SCREEN_SHARE_TRACK_NAME = 'screen-video';
export const SCREEN_SHARE_AUDIO_TRACK_NAME = 'screen-audio';
export const CAMERA_TRACK_NAME = 'camera';
export const MIC_TRACK_NAME = 'microphone';
