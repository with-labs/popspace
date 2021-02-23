import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useSaveFile() {
  const { t } = useTranslation();

  const handleExport = useCallback(
    (fileContents: string, filename: string, contentType: string = 'text/plain') => {
      const blob = new Blob([fileContents], { type: contentType });
      const url = URL.createObjectURL(blob);
      if (!url) {
        toast.error(t('error.messages.downloadFailed') as string);
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
    [t]
  );

  return handleExport;
}
