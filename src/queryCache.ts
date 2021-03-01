import { QueryCache } from 'react-query';
import api, { ApiError } from './utils/api';

const defaultQueryFn = async (key: string, data?: any) => {
  const { success, message, errorCode, ...result } = await api.post(key, data || {});
  if (!success) {
    throw new ApiError({ success, message, errorCode });
  }
  return result;
};

/**
 * A react-query cache, which caches request responses based
 * on the path and any passed data. By default it uses our
 * internal API lightweight 'sdk'
 */
export const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      queryFn: defaultQueryFn,
      // don't refetch when switching tabs or windows
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      // no cache - for now...
      cacheTime: 0,
      retry: false,
    },
  },
});
