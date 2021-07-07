import { MediaError, MEDIA_STATUS, MEDIA_TYPES } from '../../errors/MediaError';

const DENIED_MESSAGES = [
  'Permission denied',
  'The request is not allowed by the user agent or the platform in the current context.',
];
// only Chrome seems to have a "dismissed" state where the user can try again
const DISMISSED_MESSAGES = ['Permission dismissed'];

/**
 * Converts a getUserMedia or getDisplayMedia error into customized language by detecting
 * browser error messages and rewriting them.
 */
export function convertMediaError(
  error: Error,
  mediaType: MEDIA_TYPES,
  noSystemPermissionsMessage: string,
  deniedMessage?: string,
  dismissedMessage?: string
) {
  if (deniedMessage && DENIED_MESSAGES.includes(error.message)) {
    return new MediaError(deniedMessage, mediaType, MEDIA_STATUS.DENIED);
  } else if (dismissedMessage && DISMISSED_MESSAGES.includes(error.message)) {
    return new MediaError(dismissedMessage, mediaType, MEDIA_STATUS.DISMISSED);
  } else if (error.name === 'NotFoundError' || error.name === 'NotAllowedError') {
    // NotFoundError is for firefox
    // NotAllowedError is for chrome
    // this will interept this as not having system permissions
    return new MediaError(noSystemPermissionsMessage, mediaType, MEDIA_STATUS.NO_SYSTEM_PERMISSIONS);
  }
  return error;
}
