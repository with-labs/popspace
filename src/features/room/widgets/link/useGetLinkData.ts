import { useCallback } from 'react';
import api from '../../../../utils/api';
import { logger } from '../../../../utils/logger';
import { useFeatureFlag } from 'flagg';

/** Returns a function to call to retrieve opengraph data for a URL */
export function useGetLinkData() {
  const isOpenGraphEnabled = useFeatureFlag('opengraph');

  const handleSave = useCallback(
    async (rawUrl: string) => {
      const url = rawUrl.trim();

      if (!isOpenGraphEnabled) {
        return {
          url,
          title: url,
        };
      }

      try {
        const { result, success, message, errorCode } = await api.getOpenGraph(url);
        if (!success) {
          throw new Error(`${message} (code: ${errorCode})`);
        }

        return {
          url: result.url || url,
          title: result.title || url,
          mediaUrl: result.image,
          mediaContentType: result.image ? 'image' : undefined,
          description: result.description,
        };
      } catch (err) {
        logger.error(`Failed to get OpenGraph data for ${url}`, err);
        return {
          url: url,
          title: url,
        };
      }
    },
    [isOpenGraphEnabled]
  );

  return handleSave;
}
