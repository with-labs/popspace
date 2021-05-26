import { useCurrentUserProfile } from '@hooks/api/useCurrentUserProfile';
import { ApiError } from '@src/errors/ApiError';
import api from '@utils/api';
import { useCallback } from 'react';

export function useCreateMeeting() {
  const { user } = useCurrentUserProfile();

  const createMeeting = useCallback(async () => {
    const name = user?.display_name ? `${user.display_name}'s Meeting` : 'New Meeting';
    const response = await api.roomCreate(name);
    if (!response.success) {
      throw new ApiError(response);
    }
    return response.newRoom;
  }, [user]);

  return createMeeting;
}
