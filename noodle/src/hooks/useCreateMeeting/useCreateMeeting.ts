import api from '@api/client';
import { MeetingTemplateName } from '@features/meetingTemplates/templateData';
import { useCallback } from 'react';

export function useCreateMeeting() {
  const createMeeting = useCallback(async (templateName: MeetingTemplateName, password?: string, name?: string) => {
    const response = await api.createMeeting(templateName, password, name);
    return response.newMeeting;
  }, []);

  return createMeeting;
}
