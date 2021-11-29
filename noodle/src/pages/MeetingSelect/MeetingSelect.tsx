import { Analytics } from '@analytics/Analytics';
import { RouteNames } from '@constants/RouteNames';
import { MeetingTemplatePicker } from '@features/meetingTemplates/MeetingTemplatePicker';
import { MeetingTemplateName } from '@features/meetingTemplates/templateData';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { Box, CircularProgress, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory } from 'react-router';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';

const ANALYTICS_PAGE_ID = 'page_meetingSelect';

export interface IMeetingSelectProps extends RouteComponentProps<{ meetingType?: string }> {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    [theme.breakpoints.up('md')]: {
      width: 500,
    },
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

  const [hasInteracted, setHasInteracted] = React.useState(false);

  const [selected, setSelected] = React.useState<MeetingTemplateName | null>(() => {
    if (providedTemplateName && Object.values(MeetingTemplateName).includes(providedTemplateName as any)) {
      return providedTemplateName as MeetingTemplateName;
    }
    return null;
  });

  React.useEffect(() => {
    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_visited`, new Date().toUTCString());
  }, []);

  React.useEffect(() => {
    function trackClosing() {
      Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_closed`, hasInteracted);
    }

    window.addEventListener('beforeunload', trackClosing);

    return () => {
      window.removeEventListener('beforeunload', trackClosing);
    };
  }, [hasInteracted]);

  React.useEffect(() => {
    if (!selected) return;
    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_meeting_created`, providedTemplateName);

    // user has selected something on the page so we set interacted to true
    setHasInteracted(true);

    (async () => {
      try {
        const meeting = await create(selected);
        history.push(RouteNames.MEETING_LINK.replace(':meetingRoute', meeting.route), {
          meetingInfo: meeting,
        });
      } catch (err: any) {
        toast.error(err.message);
        setSelected(null);
      }
    })();
  }, [create, history, selected, providedTemplateName, setHasInteracted]);

  // for the case where the template is specified in the URL,
  // show a fullscreen loader until the meeting is created or
  // the request fails and selection is reset. `selected` will
  // be reset to null in case of a failure.
  if (providedTemplateName && selected) {
    return (
      <CenterColumnPage>
        <Typography variant="h1">{t('pages.meetingSelect.creatingTemplate')}</Typography>
        <Box
          flex={1}
          mt={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <CircularProgress />
        </Box>
      </CenterColumnPage>
    );
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
