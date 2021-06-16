import { useCallback } from 'react';
import api from '@api/client';
import { logger } from '@utils/logger';
import { useTranslation } from 'react-i18next';
import { LinkWidgetState } from '@api/roomState/types/widgets';

/** Returns a function to call to retrieve opengraph data for a URL */
export function useGetLinkData() {
  const { t } = useTranslation();

  const handleSave = useCallback(
    async (baseData: LinkWidgetState) => {
      const url = baseData.url.trim();

      if (!url) {
        return baseData;
      }

      try {
        const { result } = await api.openGraph.getOpenGraph(url);

        return {
          ...baseData,
          title: result.title ?? baseData.title ?? (t('common.link') as string),
          iframeUrl: result.iframeUrl,
          iconUrl: result.iconUrl,
        };
      } catch (err) {
        logger.debug(`Failed to get OpenGraph data for ${url}`, err);
        return baseData;
      }
    },
    [t]
  );

  return handleSave;
}
