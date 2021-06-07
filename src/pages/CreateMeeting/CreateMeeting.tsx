<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@layouts/Page/Page';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '@constants/RouteNames';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { MeetingType } from '@constants/MeetingTypeMetadata';

interface ICreateMeetingProps {}

type createParams = {
  meetingType: string;
};

export const CreateMeeting: React.FC<ICreateMeetingProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const createMeeting = useCreateMeeting();
  const { meetingType } = useParams<createParams>();

  useEffect(() => {
    setIsLoading(true);
    async function createNewMeeting(meetingType: string) {
      try {
        const meeting = await createMeeting();
        history.push(RouteNames.MEETING_LINK, {
          meetingInfo: meeting,
        });
      } catch (err) {
        //TODO: error handling
      }
    }

    // if we have a meeting
    if (meetingType) {
      // check if meeting type provided is supported
      if (!Object.values(MeetingType).includes(meetingType as MeetingType)) {
        // redirect to root with error
        // TODO: figure out how we want to handle error messing here
        history.push(RouteNames.ROOT);
      }
      // create a new meeting based on the type
      createNewMeeting(meetingType);
    } else {
      // redirect to meeting select, since we dont have a valid
      // TODO: figure out how we want to handle error messing here
      history.push(RouteNames.ROOT);
    }
  }, [meetingType]);

  return <Page isLoading={isLoading} error={error} />;
};
>>>>>>> c175535 (Adding in create meeting from link)
