import useQueryParams from '../useQueryParams/useQueryParams';
import { useParams } from 'react-router-dom';

export function useRoomName() {
  const query = useQueryParams();
  const params = useParams<{ room_name: string }>();

  return params['room_name'] || query.get('r');
}
