import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export function useSaveFile() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleExport = useCallback(
    (fileContents: string, filename: string, contentType: string = 'text/plain') => {
      const blob = new Blob([fileContents], { type: contentType });
      const url = URL.createObjectURL(blob);
      if (!url) {
        enqueueSnackbar(t('errors.messages.downloadFailed'), { variant: 'error' });
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
    [enqueueSnackbar, t]
  );

  return handleExport;
}
