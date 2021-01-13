import useQueryParams from '../useQueryParams/useQueryParams';
import { useParams } from 'react-router-dom';

export function useRoomName() {
  const query = useQueryParams();
  const params = useParams<{ roomName: string }>();

  return params['roomName'] || query.get('r');
}
