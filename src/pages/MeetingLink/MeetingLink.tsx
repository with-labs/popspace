import * as React from 'react';
import clsx from 'clsx';
import { makeStyles, Typography, Box, TextField, Button, MuiThemeProvider } from '@material-ui/core';
import { RouteComponentProps, useHistory } from 'react-router';
import { ApiNamedMeeting } from '@api/types';
import { useTranslation } from 'react-i18next';
import { RouteNames } from '@constants/RouteNames';
import { lavender, mandarin, oregano } from '@src/theme/theme';
import { useExpiringToggle } from '@hooks/useExpiringToggle/useExpiringToggle';
import { CopyIcon } from '@components/icons/CopyIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import toast from 'react-hot-toast';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import { logger } from '@utils/logger';
import { Link } from '@components/Link/Link';

// TODO: change this to the shortened url
const BASE_URL = 'https://www.noodle.so';

export interface IMeetingLinkProps extends RouteComponentProps<{ meetingRoute: string }> {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    width: 290,
    color: theme.palette.brandColors.vintageInk.regular,
    paddingBottom: theme.spacing(4),
  },
  inputRoot: {
    height: 70,
    '&:hover $notchedOutline': {
      borderColor: theme.palette.brandColors.lavender.bold,
      borderWidth: 3,
    },
    '&.Mui-focused $notchedOutline': {
      borderColor: theme.palette.brandColors.lavender.bold,
      borderWidth: 3,
    },
  },
  input: {
    textOverflow: 'ellipsis',
  },
  notchedOutline: {
    borderColor: theme.palette.brandColors.lavender.bold,
    borderWidth: 3,
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

export const MeetingLink: React.FC<IMeetingLinkProps> = ({
  match: {
    params: { meetingRoute },
  },
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [toggleCopyButton, setToggleCopyButton] = useExpiringToggle(false);

  // if we are on prod, use the shortented base url for share links, otherwise just
  // use the origin of whatever url we are using
  const meetingUrl = `${process.env.NODE_ENV !== 'production' ? window.location.origin : BASE_URL}/${meetingRoute}`;

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const onCopyLink = async () => {
    try {
      setToggleCopyButton(true);
      await navigator.clipboard.writeText(meetingUrl);
      toast.success(t('features.roomControls.linkCopied') as string);
      // todo: add analytics
    } catch (err) {
      // todo: clean up error state
      alert(`Error copying public invite link`);
      logger.error(err);
    }
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
          inputRef={inputRef}
          inputProps={{ readOnly: true }}
          onFocus={(ev) => ev.target.select()}
          InputProps={{
            classes: { root: classes.inputRoot, input: classes.input, notchedOutline: classes.notchedOutline },
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
                  <Link disableStyling to={meetingUrl}>
                    <Button className={clsx(classes.buttonRoot, classes.joinBtn)}>
                      {t('pages.meetingLink.joinRoomButton')}
                    </Button>
                  </Link>
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
