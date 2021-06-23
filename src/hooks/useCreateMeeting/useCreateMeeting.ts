import { MeetingTemplateName, meetingTemplates } from '@src/constants/MeetingTypeMetadata';
import api from '@api/client';
import { useCallback } from 'react';

export function useCreateMeeting() {
  const createMeeting = useCallback(async (templateName: MeetingTemplateName) => {
    const response = await api.createMeeting(meetingTemplates[templateName], templateName);
    return response.newMeeting;
  }, []);

  return createMeeting;
}
