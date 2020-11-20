import { useQuery } from 'react-query';
import { ApiUser, ApiRoom } from '../../utils/api';

export function useCurrentUserProfile() {
  const { data, isLoading } = useQuery<{ profile?: { user: ApiUser; rooms: { member: ApiRoom[]; owned: ApiRoom[] } } }>(
    '/user_profile'
  );

  const profile = data?.profile;

  return { currentUserProfile: profile, isLoading };
}
