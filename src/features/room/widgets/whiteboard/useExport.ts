import { useRef, useCallback } from 'react';
import useVideoContext from '../../../../hooks/useVideoContext/useVideoContext';
import { useSnackbar } from 'notistack';

export function useExport() {
  const ref = useRef<{ exportToImageURL: () => string }>(null);

  const { room } = useVideoContext();

  const { enqueueSnackbar } = useSnackbar();

  const handleExport = useCallback(() => {
    const url = ref.current?.exportToImageURL();
    if (!url) {
      enqueueSnackbar("That didn't work - try again?", { variant: 'error' });
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard_${room.name}_${new Date().toString()}.png`;

    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener('click', clickHandler);
        a.remove();
      }, 150);
    };

    a.addEventListener('click', clickHandler, false);

    a.click();
  }, [enqueueSnackbar, room.name]);

  return { ref, handleExport };
}
