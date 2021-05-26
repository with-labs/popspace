import { useQuery, useQueryCache } from 'react-query';
import { ApiUser, ApiParticipantState } from '@utils/api';
import { ApiError } from '../../errors/ApiError';

import { useMemo } from 'react';
import { RoomInfo } from '../../types/api';
import { Updater } from 'react-query/types/core/utils';

export type UserProfile = {
  user: ApiUser;
  participantState: ApiParticipantState;
  rooms: { member: RoomInfo[]; owned: RoomInfo[] };
};
export type ProfileData = { profile?: UserProfile };

export function useCurrentUserProfile() {
  const result = useQuery<ProfileData, ApiError>('/user_profile');
  const cache = useQueryCache();

  return useMemo(() => {
    const { data, isLoading, ...rest } = result;
    const profile = data?.profile;
    // provide an updater function to optimistically set user data
    const update = (updater: Updater<ProfileData | undefined, ProfileData>) =>
      cache.setQueryData<ProfileData>('/user_profile', updater);
    return { profile: profile, user: profile?.user, isLoading, update, ...rest };
  }, [result, cache]);
}
