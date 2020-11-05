import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

export function useSaveFile() {
  const { enqueueSnackbar } = useSnackbar();

  const handleExport = useCallback(
    (fileContents: string, filename: string, contentType: string = 'text/plain') => {
      const blob = new Blob([fileContents], { type: contentType });
      const url = URL.createObjectURL(blob);
      if (!url) {
        enqueueSnackbar("That didn't work - try again?", { variant: 'error' });
        return;
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.removeEventListener('click', clickHandler);
          a.remove();
        }, 150);
      };

      a.addEventListener('click', clickHandler, false);

      a.click();
    },
    [enqueueSnackbar]
  );

  return handleExport;
}
