import * as React from 'react';
import clsx from 'clsx';
import { makeStyles, Typography, Box, TextField, Button, MuiThemeProvider } from '@material-ui/core';
import { useHistory } from 'react-router';
import { ApiNamedMeeting } from '@api/types';
import { useTranslation } from 'react-i18next';
import { RouteNames } from '@constants/RouteNames';
import { lavender, mandarin, oregano } from '@src/theme/theme';
import { useExpiringToggle } from '@hooks/useExpiringToggle/useExpiringToggle';
import { CopyIcon } from '@components/icons/CopyIcon';
import { DoneIcon } from '@components/icons/DoneIcon';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';

// TODO: change this to the shortened url
const BASE_URL = 'https://www.noodle.so';

export interface IMeetingLinkProps {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    width: 290,
  },
  inputRoot: {
    height: 70,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.brandColors.lavender.ink,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.brandColors.lavender.ink,
    },
  },
  notchedOutline: {
    borderColor: theme.palette.brandColors.lavender.ink,
  },
  buttonRoot: {
    height: 48,
    padding: 0,
  },
  copyBtn: {
    width: 146,
  },
  joinBtn: {
    width: 166,
  },
  copied: {
    marginRight: 18,
  },
}));

export const MeetingLink: React.FC<IMeetingLinkProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [toggleCopyButton, setToggleCopyButton] = useExpiringToggle(false);

  const history = useHistory<{ meetingInfo: ApiNamedMeeting }>();
  const meetingInfo = history.location.state?.meetingInfo;

  // if we are on prod, use the shortented base url for share links, otherwise just
  // use the origin of whatever url we are using
  const meetingUrl = meetingInfo
    ? `${process.env.NODE_ENV !== 'production' ? window.location.origin : BASE_URL}/${meetingInfo.route}`
    : '';

  React.useEffect(() => {
    // if meeting info is empty, redirect to the dashboard
    if (!meetingInfo) {
      history.push(RouteNames.ROOT);
    }
  }, [meetingInfo]);

  const onCopyLink = async () => {
    try {
      if (meetingInfo) {
        setToggleCopyButton(true);
        await navigator.clipboard.writeText(meetingUrl);
        // todo: add analytics
      }
    } catch (err) {
      // todo: clean up error state
      alert(`Error copying public invite link`);
      console.log(err);
    }
  };

  const onGoToMeeting = () => {
    if (meetingInfo) {
      history.push(`/${meetingInfo.route}`);
    }
    // todo: error state if we some how dont have meeting info?
  };

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.explanationText}>
        {t('pages.meetingLink.titleText')}
      </Typography>
      <Box mt={4} mb={4} width="100%">
        <TextField
          classes={{ root: classes.inputRoot }}
          variant="outlined"
          fullWidth
          value={meetingUrl}
          inputProps={{ readOnly: true }}
          InputProps={{
            classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline },
            endAdornment: (
              <Box display="flex" flexDirection="row">
                <Box mr={1.5}>
                  <MuiThemeProvider theme={toggleCopyButton ? oregano : mandarin}>
                    <Button
                      classes={
                        toggleCopyButton
                          ? {
                              startIcon: classes.copied,
                            }
                          : {}
                      }
                      startIcon={toggleCopyButton ? <DoneIcon /> : <CopyIcon />}
                      className={clsx(classes.buttonRoot, classes.copyBtn)}
                      onClick={onCopyLink}
                    >
                      {t(`pages.meetingLink.${toggleCopyButton ? 'copied' : 'copyLinkButton'}`)}
                    </Button>
                  </MuiThemeProvider>
                </Box>
                <MuiThemeProvider theme={lavender}>
                  <Button className={clsx(classes.buttonRoot, classes.joinBtn)} onClick={onGoToMeeting}>
                    {t('pages.meetingLink.joinRoomButton')}
                  </Button>
                </MuiThemeProvider>
              </Box>
            ),
          }}
        />
      </Box>
      <Typography variant="body1">{t('pages.meetingLink.explanationText')}</Typography>
    </CenterColumnPage>
  );
};
