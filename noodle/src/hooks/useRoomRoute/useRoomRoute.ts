import useQueryParams from '../useQueryParams/useQueryParams';
import { useParams } from 'react-router-dom';

export function useRoomRoute() {
  const query = useQueryParams();
  const params = useParams<{ roomRoute: string }>();

  return params['roomRoute'] || query.get('r') || undefined;
}
