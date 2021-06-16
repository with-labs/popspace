import { MeetingTemplateName, meetingTemplates } from '@src/constants/MeetingTypeMetadata';
import api from '@api/client';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export function useCreateMeeting() {
  const createMeeting = useCallback(async (templateName: MeetingTemplateName) => {
    try {
      const response = await api.createMeeting(meetingTemplates[templateName]);
      return response.newMeeting;
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  return createMeeting;
}
