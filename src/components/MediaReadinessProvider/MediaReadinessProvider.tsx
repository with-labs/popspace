import * as React from 'react';
import { isMobileOnly } from 'react-device-detect';

export const MediaReadinessContext = React.createContext({
  isReady: false,
  onReady: () => {},
});

/**
 * Provides a context which indicates if the user has interacted with the page,
 * which means we are ready to mount and play <audio /> and <video /> elements with
 * autoplay. Before the user has made a gesture, autoplay will not work - so we
 * must wait and capture the gesture before proceeding.
 */
export const MediaReadinessProvider: React.FC = ({ children }) => {
  const [isReady, setIsReady] = React.useState(false);
  const onReady = React.useCallback(() => setIsReady(true), []);
  const value = React.useMemo(
    () => ({
      isReady,
      onReady,
    }),
    [isReady, onReady]
  );

  React.useEffect(() => {
    if (isMobileOnly) {
      // on mobile, we need to reset the readiness state when the user backgrounds
      // the browser tab, since an unfocused tab closes media contexts and requires
      // a new gesture to activate again
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          setIsReady(false);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  return <MediaReadinessContext.Provider value={value}>{children}</MediaReadinessContext.Provider>;
};
