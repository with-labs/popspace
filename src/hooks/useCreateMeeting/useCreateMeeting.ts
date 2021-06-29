import { MeetingTemplateName, meetingTemplates } from '@features/meetingTemplates/templateData/templateData';
import api from '@api/client';
import { useCallback } from 'react';

export function useCreateMeeting() {
  const createMeeting = useCallback(async (templateName: MeetingTemplateName) => {
    const response = await api.createMeeting(meetingTemplates[templateName], templateName);
    return response.newMeeting;
  }, []);

  return createMeeting;
}
