import { Analytics } from '@analytics/Analytics';
import { CopyIcon } from '@components/icons/CopyIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import { Link } from '@components/Link/Link';
import { Spacing } from '@components/Spacing/Spacing';
import { useExpiringToggle } from '@hooks/useExpiringToggle/useExpiringToggle';
import {
  Box,
  Button,
  makeStyles,
  TextField,
  Theme,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { mandarin } from '@src/theme/theme';
import { logger } from '@utils/logger';
import clsx from 'clsx';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';


const ANALYTICS_PAGE_ID = 'page_meetingLink';

export interface IMeetingLinkProps extends RouteComponentProps<{ meetingRoute: string }> {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    width: 290,
    color: theme.palette.brandColors.vintageInk.regular,
    paddingBottom: theme.spacing(4),
  },
  inputRoot: {
    height: 70,
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      height: '100%',
      padding: theme.spacing(2),
    },
  },
  input: {
    textOverflow: 'ellipsis',
  },
  notchedOutline: {
    boxShadow: `0 0 0 6px ${theme.palette.brandColors.lavender.bold}`,
    border: 'none',
  },
  copied: {
    backgroundColor: theme.palette.brandColors.oregano.light,
    color: theme.palette.brandColors.oregano.ink,
    '&&:focus, &&.Mui-focusVisible': {
      backgroundColor: theme.palette.brandColors.oregano.light,
      boxShadow: theme.focusRings.create(theme.palette.brandColors.oregano.bold),
    },
    '&&:hover': {
      backgroundColor: theme.palette.brandColors.oregano.regular,
    },
  },
  toggleCopyButton: {
    [theme.breakpoints.up('sm')]: {
      minWidth: 146,
    },
  },
  inputButtons: {
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    },
  },
}));

export const MeetingLink: React.FC<IMeetingLinkProps> = ({
  match: {
    params: { meetingRoute },
  },
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [toggleCopyButton, setToggleCopyButton] = useExpiringToggle(false, 3000);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  const meetingUrl = `${window.location.origin}/${meetingRoute}`;

  const inputRef = React.useRef<HTMLInputElement>(null);

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
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const onCopyLink = async () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    try {
      setToggleCopyButton(true);
      await navigator.clipboard.writeText(meetingUrl);
      Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_buttonPressed`, 'copyLink');
    } catch (err) {
      toast.error(t('pages.meetingLink.copyErrorMsg') as string);
      logger.error(err);
    }
  };

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.explanationText}>
        {t('pages.meetingLink.titleText')}
      </Typography>
      <Box mt={4} mb={4} width="100%" alignItems="center">
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
              <Spacing
                className={classes.inputButtons}
                flexShrink={0}
                flexBasis="auto"
                flexDirection={isSmall ? 'column' : 'row'}
              >
                <ThemeProvider theme={mandarin}>
                  <Button
                    fullWidth={isSmall}
                    startIcon={toggleCopyButton ? <DoneIcon /> : <CopyIcon />}
                    className={clsx(classes.toggleCopyButton, toggleCopyButton && classes.copied)}
                    onClick={onCopyLink}
                    color="primary"
                    style={{ flexBasis: 'auto', flexShrink: 0 }}
                  >
                    {t(`pages.meetingLink.${toggleCopyButton ? 'copied' : 'copyLinkButton'}`)}
                  </Button>
                </ThemeProvider>
                <Link
                  disableStyling
                  to={`/${meetingRoute}`}
                  newTab={false}
                  style={{ flexBasis: 'auto', flexShrink: 0 }}
                  onClick={() => {
                    if (!hasInteracted) {
                      setHasInteracted(true);
                    }
                    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_buttonPressed`, 'joinRoom');
                  }}
                >
                  <Button tabIndex={-1} fullWidth={isSmall}>
                    {t('pages.meetingLink.joinRoomButton')}
                  </Button>
                </Link>
              </Spacing>
            ),
          }}
        />
        <Typography style={{ margin: 'auto', textAlign: 'center' }} variant="body1">
          {t('pages.meetingLink.explanationText')}
        </Typography>
      </Box>
    </CenterColumnPage>
  );
};
