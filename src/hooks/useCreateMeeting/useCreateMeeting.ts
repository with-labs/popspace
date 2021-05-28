import { MeetingTemplateName, meetingTemplates } from '@constants/meetingTemplates';
import { ApiError } from '@src/errors/ApiError';
import api from '@utils/api';
import { useCallback } from 'react';

export function useCreateMeeting() {
  const createMeeting = useCallback(async (templateName: MeetingTemplateName) => {
    const response = await api.createMeeting(meetingTemplates[templateName]);
    if (!response.success) {
      throw new ApiError(response);
    }
    return response.newMeeting;
  }, []);

  return createMeeting;
}
