import useQuery from '../useQuery/useQuery';
import { useParams } from 'react-router-dom';

export function useRoomName() {
  const query = useQuery();
  const params = useParams<{ room_name: string }>();

  return params['room_name'] || query.get('r');
}
