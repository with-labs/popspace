import * as React from 'react';
import { EventNames } from '@analytics/constants';
import { MeetingTemplateName } from '@src/constants/MeetingTypeMetadata';
import { MeetingTemplatePicker } from '@features/meetingTemplates/MeetingTemplatePicker';
import { useAnalytics } from '@hooks/useAnalytics/useAnalytics';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { Typography, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory } from 'react-router';
import { RouteNames } from '@constants/RouteNames';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import toast from 'react-hot-toast';
import { FullscreenLoading } from '@components/FullscreenLoading/FullscreenLoading';

export interface IMeetingSelectProps extends RouteComponentProps<{ meetingType?: string }> {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    width: 500,
    textAlign: 'center',
    color: theme.palette.brandColors.vintageInk.regular,
    paddingBottom: theme.spacing(4),
  },
}));

export const MeetingSelect: React.FC<IMeetingSelectProps> = ({
  match: {
    params: { meetingType: providedTemplateName },
  },
}) => {
  const { t } = useTranslation();
  const create = useCreateMeeting();
  const history = useHistory();
  const classes = useStyles();

  const analytics = useAnalytics();

  const [selected, setSelected] = React.useState<MeetingTemplateName | null>(() => {
    if (providedTemplateName && Object.values(MeetingTemplateName).includes(providedTemplateName as any)) {
      return providedTemplateName as MeetingTemplateName;
    }
    return null;
  });

  React.useEffect(() => {
    if (!selected) return;
    analytics.trackEvent(EventNames.CREATE_MEETING_FROM_TEMPLATE, {
      templateName: providedTemplateName,
    });
    (async () => {
      try {
        const meeting = await create(selected);
        history.push(RouteNames.MEETING_LINK.replace(':meetingRoute', meeting.route), {
          meetingInfo: meeting,
        });
      } catch (err) {
        toast.error(err.message);
        setSelected(null);
      }
    })();
  }, [analytics, create, history, selected, providedTemplateName]);

  // for the case where the template is specified in the URL,
  // show a fullscreen loader until the meeting is created or
  // the request fails and selection is reset. `selected` will
  // be reset to null in case of a failure.
  if (providedTemplateName && selected) {
    return <FullscreenLoading />;
  }

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.explanationText}>
        {t('pages.meetingSelect.titleText')}
      </Typography>
      <MeetingTemplatePicker onSelect={setSelected} selected={selected} />
    </CenterColumnPage>
  );
};
