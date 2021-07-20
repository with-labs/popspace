import api from '@api/client';
import { MeetingTemplateName } from '@features/meetingTemplates/templateData';
import { useCallback } from 'react';

export function useCreateMeeting() {
  const createMeeting = useCallback(async (templateName: MeetingTemplateName) => {
    const response = await api.createMeeting(templateName);
    return response.newMeeting;
  }, []);

  return createMeeting;
}
