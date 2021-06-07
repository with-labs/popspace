import { EventNames } from '@analytics/constants';
import { MeetingTemplateName } from '@features/meetingTemplates/constants';
import { MeetingTemplatePicker } from '@features/meetingTemplates/MeetingTemplatePicker';
import { useAnalytics } from '@hooks/useAnalytics/useAnalytics';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

export function CreateMeeting() {
  const { t } = useTranslation();
  const create = useCreateMeeting();
  const history = useHistory();

  const analytics = useAnalytics();

  const onSelect = async (templateName: MeetingTemplateName) => {
    analytics.trackEvent(EventNames.CREATE_MEETING_FROM_TEMPLATE, {
      templateName,
    });
    const meeting = await create(templateName);
    history.push(`/${meeting.route}?join`);
  };

  return (
    <Box flex={1} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
      <Box width="100%" maxWidth="800px" display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h1" style={{ maxWidth: 600, textAlign: 'center', marginBottom: 24 }}>
          {t('pages.createRoom.meetingTemplate.title')}
        </Typography>
        <MeetingTemplatePicker onSelect={onSelect} />
      </Box>
    </Box>
  );
}
