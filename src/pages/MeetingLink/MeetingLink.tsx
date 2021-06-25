import * as React from 'react';
import clsx from 'clsx';
import { makeStyles, Typography, Box, TextField, Button } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useExpiringToggle } from '@hooks/useExpiringToggle/useExpiringToggle';
import { CopyIcon } from '@components/icons/CopyIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import toast from 'react-hot-toast';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import { logger } from '@utils/logger';
import { Link } from '@components/Link/Link';
import { Spacing } from '@components/Spacing/Spacing';
import { ExtensionCard } from './ExtensionCard';

import gcal from './images/calendar.png';
import outlook from './images/outlook.png';
import chrome from './images/chrome.png';
import slack from './images/slack.png';

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
}));

export const MeetingLink: React.FC<IMeetingLinkProps> = ({
  match: {
    params: { meetingRoute },
  },
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [toggleCopyButton, setToggleCopyButton] = useExpiringToggle(false, 3000);

  const meetingUrl = `${window.location.origin}/${meetingRoute}`;

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
      // todo: add analytics
    } catch (err) {
      // todo: i18n
      toast.error(`Error copying public invite link`);
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
              <Spacing flexShrink={0} flexBasis="auto">
                <Button
                  fullWidth={false}
                  startIcon={toggleCopyButton ? <DoneIcon /> : <CopyIcon />}
                  className={clsx(toggleCopyButton && classes.copied)}
                  onClick={onCopyLink}
                  color="secondary"
                  style={{ flexBasis: 'auto', flexShrink: 0 }}
                >
                  {t(`pages.meetingLink.${toggleCopyButton ? 'copied' : 'copyLinkButton'}`)}
                </Button>
                <Link
                  disableStyling
                  to={`/${meetingRoute}`}
                  newTab={false}
                  style={{ flexBasis: 'auto', flexShrink: 0 }}
                >
                  <Button fullWidth={false}>{t('pages.meetingLink.joinRoomButton')}</Button>
                </Link>
              </Spacing>
            ),
          }}
        />
        <Typography style={{ margin: 'auto', textAlign: 'center' }} variant="body1">
          {t('pages.meetingLink.explanationText')}
        </Typography>
      </Box>
      <Spacing>
        <ExtensionCard
          iconSrc={slack}
          iconAlt={t('pages.meetingLink.extensions.slack.iconAlt')}
          label={t('pages.meetingLink.extensions.slack.label')}
        />
        <ExtensionCard
          iconSrc={chrome}
          iconAlt={t('pages.meetingLink.extensions.browser.chomeIconAlt')}
          label={t('pages.meetingLink.extensions.browser.label')}
        />
        <ExtensionCard
          iconSrc={outlook}
          iconAlt={t('pages.meetingLink.extensions.outlook.iconAlt')}
          label={t('pages.meetingLink.extensions.outlook.label')}
        />
        <ExtensionCard
          iconSrc={gcal}
          iconAlt={t('pages.meetingLink.extensions.google.iconAlt')}
          label={t('pages.meetingLink.extensions.google.label')}
        />
      </Spacing>
    </CenterColumnPage>
  );
};
