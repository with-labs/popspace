import * as React from 'react';

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

  return <MediaReadinessContext.Provider value={value}>{children}</MediaReadinessContext.Provider>;
};
