import { QueryCache } from 'react-query';
import api from './utils/api';

const defaultQueryFn = async (key: string, data?: any) => {
  const { success, message, ...result } = await api.post(key, data || {});
  if (!success) {
    throw new Error(message);
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
    },
  },
});
