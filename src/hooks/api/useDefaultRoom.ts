import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryCache } from 'react-query';
import { ApiError } from '../../errors/ApiError';
import api, { SERVICES } from '../../utils/api';

export function useDefaultRoom() {
  const { t } = useTranslation();
  const { data, ...result } = useQuery<{ roomRoute: string }, ApiError>([
    '/get_or_init_default_room',
    {},
    SERVICES.api,
  ]);
  const cache = useQueryCache();
  const setRoomRoute = useCallback(
    async (route: string) => {
      try {
        const result = await api.setDefaultRoom(route);
        if (!result.success) throw new ApiError(result);
        cache.setQueryData<{ roomRoute: string }>(['/get_or_init_default_room', {}, SERVICES.api], {
          roomRoute: route,
        });
      } catch (err) {
        toast.error(t('error.messages.defaultRoomSetFailed') as string);
      }
    },
    [cache, t]
  );

  return {
    ...result,
    data: data?.roomRoute || null,
    update: setRoomRoute,
  };
}
