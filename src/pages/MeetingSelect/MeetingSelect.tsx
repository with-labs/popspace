import * as React from 'react';
import { EventNames } from '@analytics/constants';
import { MeetingTemplateName } from '@src/constants/MeetingTypeMetadata';
import { MeetingTemplatePicker } from '@features/meetingTemplates/MeetingTemplatePicker';
import { useAnalytics } from '@hooks/useAnalytics/useAnalytics';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { Typography, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { RouteNames } from '@constants/RouteNames';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';

export interface IMeetingSelectProps {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    width: 500,
    textAlign: 'center',
  },
}));

export const MeetingSelect: React.FC<IMeetingSelectProps> = () => {
  const { t } = useTranslation();
  const create = useCreateMeeting();
  const history = useHistory();
  const classes = useStyles();

  const analytics = useAnalytics();

  const onSelect = async (templateName: MeetingTemplateName) => {
    analytics.trackEvent(EventNames.CREATE_MEETING_FROM_TEMPLATE, {
      templateName,
    });
    const meeting = await create(templateName);
    history.push(RouteNames.MEETING_LINK, {
      meetingInfo: meeting,
    });
  };

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.explanationText}>
        {t('pages.meetingSelect.titleText')}
      </Typography>
      <MeetingTemplatePicker onSelect={onSelect} />
    </CenterColumnPage>
  );
};
