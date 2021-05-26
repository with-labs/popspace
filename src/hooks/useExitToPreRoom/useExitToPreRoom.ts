import { useEffect, useContext } from 'react';
import { MediaReadinessContext } from '@components/MediaReadinessProvider/MediaReadinessProvider';

export function useExitToPreRoom() {
  const { isReady, resetReady } = useContext(MediaReadinessContext);

  useEffect(() => {
    const onBack = () => {
      if (isReady) {
        resetReady();
      }
    };
    window.addEventListener('popstate', onBack);

    return () => {
      window.removeEventListener('popstate', onBack);
    };
  }, [isReady, resetReady]);
}
