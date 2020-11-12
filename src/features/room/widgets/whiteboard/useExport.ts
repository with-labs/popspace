import { useCallback } from 'react';
import useVideoContext from '../../../../hooks/useVideoContext/useVideoContext';
import { useSnackbar } from 'notistack';

export function useExport(exportToImageURL: () => string) {
  const { room } = useVideoContext();

  const { enqueueSnackbar } = useSnackbar();

  const handleExport = useCallback(() => {
    const url = exportToImageURL();
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
  }, [enqueueSnackbar, exportToImageURL, room.name]);

  return handleExport;
}
