import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useExport(exportToImageURL: () => string) {
  const { t } = useTranslation();

  const handleExport = useCallback(() => {
    const url = exportToImageURL();
    if (!url) {
      toast.error(t('widgets.whiteboard.exportFailed') as string);
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard_${new Date().toString()}.png`;

    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener('click', clickHandler);
        a.remove();
      }, 150);
    };

    a.addEventListener('click', clickHandler, false);

    a.click();
  }, [t, exportToImageURL]);

  return handleExport;
}
