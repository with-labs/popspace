import { useQuery } from 'react-query';
import { ApiUser, ApiError } from '../../utils/api';
import { useMemo } from 'react';
import { RoomInfo } from '../../types/api';

export function useCurrentUserProfile() {
  const result = useQuery<{ profile?: { user: ApiUser; rooms: { member: RoomInfo[]; owned: RoomInfo[] } } }, ApiError>(
    '/user_profile'
  );

  return useMemo(() => {
    const { data, isLoading, ...rest } = result;
    const profile = data?.profile;
    return { profile: profile, user: profile?.user, isLoading, ...rest };
  }, [result]);
}
