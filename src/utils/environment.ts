/**
 * NOTE: Borrowed from the starter app.
 */
export const isMobile = () => {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    return false;
  }
  return /Mobile/.test(navigator.userAgent);
};
