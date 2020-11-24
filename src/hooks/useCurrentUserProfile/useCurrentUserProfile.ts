import { useQuery } from 'react-query';
import { ApiUser, ApiRoom } from '../../utils/api';
import { useMemo } from 'react';

export function useCurrentUserProfile() {
  const { data, isLoading } = useQuery<{ profile?: { user: ApiUser; rooms: { member: ApiRoom[]; owned: ApiRoom[] } } }>(
    '/user_profile'
  );

  const profile = data?.profile;

  return useMemo(() => {
    return { currentUserProfile: profile, isLoading };
  }, [profile, isLoading]);
}
