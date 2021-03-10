import { mandarin } from '../theme/theme';

/**
 * NOTE: Borrowed from the starter app.
 */
export const isMobile = () => {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    return false;
  }
  return /Mobile/.test(navigator.userAgent);
};

export const isSmallScreen = () => {
  return (
    typeof window !== 'undefined' && window.matchMedia(mandarin.breakpoints.down('sm').replace('@media ', '')).matches
  );
};
