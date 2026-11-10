import { Analytics } from '@analytics/Analytics';
import { RouteNames } from '@constants/RouteNames';
import { MeetingTemplatePicker } from '@features/meetingTemplates/MeetingTemplatePicker';
import { MeetingTemplateName } from '@features/meetingTemplates/templateData';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import client from '@api/client';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@material-ui/core';
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
  access: {
    width: '100%',
    maxWidth: 500,
    paddingBottom: theme.spacing(4),
  },
}));

const MIN_ROOM_PASSWORD_LENGTH = 12;

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

  const [accessMode, setAccessMode] = React.useState<'public' | 'password'>('public');
  const [roomPassword, setRoomPassword] = React.useState('');
  // read at creation time without re-triggering the create effect while typing
  const accessRef = React.useRef({ accessMode, roomPassword });
  accessRef.current = { accessMode, roomPassword };

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

    const password = accessRef.current.accessMode === 'password' ? accessRef.current.roomPassword : undefined;
    if (password !== undefined && password.length < MIN_ROOM_PASSWORD_LENGTH) {
      toast.error(t('pages.meetingSelect.passwordTooShort') as string);
      setSelected(null);
      return;
    }

    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_meeting_created`, providedTemplateName);

    // user has selected something on the page so we set interacted to true
    setHasInteracted(true);

    (async () => {
      try {
        const meeting = await create(selected, password);
        history.push(RouteNames.MEETING_LINK.replace(':meetingRoute', meeting.route), {
          meetingInfo: meeting,
        });
      } catch (err: any) {
        toast.error(err.message);
        setSelected(null);
      }
    })();
  }, [create, history, selected, providedTemplateName, setHasInteracted, t]);

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
      <Box className={classes.access}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('pages.meetingSelect.accessLabel')}</FormLabel>
          <RadioGroup row value={accessMode} onChange={(ev) => setAccessMode(ev.target.value as any)}>
            <FormControlLabel value="public" control={<Radio />} label={t('pages.meetingSelect.publicOption')} />
            <FormControlLabel value="password" control={<Radio />} label={t('pages.meetingSelect.passwordOption')} />
          </RadioGroup>
        </FormControl>
        {accessMode === 'password' && (
          <TextField
            label={t('pages.meetingSelect.passwordLabel')}
            type="password"
            autoComplete="new-password"
            value={roomPassword}
            onChange={(ev) => setRoomPassword(ev.target.value)}
            inputProps={{ maxLength: 128 }}
            fullWidth
            margin="normal"
          />
        )}
      </Box>
      <MeetingTemplatePicker onSelect={setSelected} selected={selected} />
      {client.actor?.admin && (
        <Box mt={4}>
          <Button variant="text" onClick={() => client.adminLogout()}>
            {t('pages.meetingSelect.signOut')}
          </Button>
        </Box>
      )}
    </CenterColumnPage>
  );
};
