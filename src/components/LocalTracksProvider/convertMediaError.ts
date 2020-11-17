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
export function convertMediaError(error: Error, deniedMessage?: string, dismissedMessage?: string) {
  if (deniedMessage && DENIED_MESSAGES.includes(error.message)) {
    return new Error(deniedMessage);
  } else if (dismissedMessage && DISMISSED_MESSAGES.includes(error.message)) {
    return new Error(dismissedMessage);
  }
  return error;
}
