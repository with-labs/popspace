import { useQuery } from 'react-query';
import { ApiUser, ApiRoom, ApiError } from '../../utils/api';
import { useMemo } from 'react';

export function useCurrentUserProfile() {
  const result = useQuery<{ profile?: { user: ApiUser; rooms: { member: ApiRoom[]; owned: ApiRoom[] } } }, ApiError>(
    '/user_profile'
  );

  return useMemo(() => {
    const { data, isLoading, ...rest } = result;
    const profile = data?.profile;
    return { profile: profile, user: profile?.user, isLoading, ...rest };
  }, [result]);
}
