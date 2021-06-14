import { QueryCache } from 'react-query';
import client, { Service } from './api/client';

const defaultQueryFn = (key: string, data: any = {}, service: Service) => {
  return client.post(key, data, service);
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
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
