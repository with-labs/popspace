const DENIED_MESSAGES = [
  'Permission denied',
  'The request is not allowed by the user agent or the platform in the current context.',
];
// only Chrome seems to have a "dismissed" state where the user can try again
const DISMISSED_MESSAGES = ['Permission dismissed'];

const SYSTEM_PERMISSIONS_ERROR_NAMES = ['NotAllowedError', 'NotFoundError'];

export function isMediaDeniedError(error: Error) {
  return DENIED_MESSAGES.some((message) => error.message.includes(message));
}

export function isMediaDismissedError(error: Error) {
  return DISMISSED_MESSAGES.some((message) => error.message.includes(message));
}

export function isSystemPermissionsError(error: Error) {
  return SYSTEM_PERMISSIONS_ERROR_NAMES.some((name) => error.name === name);
}
