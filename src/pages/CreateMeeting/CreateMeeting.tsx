import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@layouts/Page/Page';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '@constants/RouteNames';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { MeetingTemplateName } from '@src/constants/MeetingTypeMetadata';

interface ICreateMeetingProps {}

type createParams = {
  meetingType: string;
};

export const CreateMeeting: React.FC<ICreateMeetingProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const createMeeting = useCreateMeeting();
  const { meetingType } = useParams<createParams>();

  useEffect(() => {
    setIsLoading(true);
    async function createNewMeeting(meetingType: MeetingTemplateName) {
      try {
        const meeting = await createMeeting(meetingType);
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
      if (!Object.values(MeetingTemplateName).includes(meetingType as MeetingTemplateName)) {
        // redirect to root with error
        // TODO: figure out how we want to handle error messing here
        history.push(RouteNames.CREATE_MEETING);
        return;
      }
      // create a new meeting based on the type
      createNewMeeting(meetingType as MeetingTemplateName);
    } else {
      // redirect to meeting select, since we dont have a valid
      // TODO: figure out how we want to handle error messing here
      history.push(RouteNames.CREATE_MEETING);
    }
  }, [createMeeting, history, meetingType]);

  return <Page isLoading={isLoading} />;
};
