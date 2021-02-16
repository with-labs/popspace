import React, { useState, forwardRef } from 'react';
import { makeStyles, Box, Switch, Typography, Button } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import clsx from 'clsx';
import { useSpring, animated } from '@react-spring/web';
import { useSnackbar } from 'notistack';
import { useIsRoomOwner } from '../../../hooks/useIsRoomOwner/useIsRoomOwner';

export interface IInviteLinkProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  root: {
    borderRadius: theme.shape.contentBorderRadius,
    padding: theme.spacing(2),
    maxWidth: 360,
    marginBottom: theme.spacing(2),
  },
  inactive: {
    backgroundColor: theme.palette.brandColors.slate.light,
  },
  active: {
    backgroundColor: theme.palette.brandColors.oregano.surface,
  },
  swtichWrapper: {
    marginBottom: theme.spacing(1),
  },
  explanationTextWrapper: {
    marginTop: theme.spacing(2),
  },
  explanationText: {
    color: theme.palette.brandColors.slate.ink,
  },
  resetLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: theme.palette.brandColors.ink.regular,
    verticalAlign: 'baseline',
    minWidth: 0,
  },
}));

export const InviteLink = forwardRef<HTMLDivElement, IInviteLinkProps>((props, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const isRoomOwner = useIsRoomOwner();

  const [linkActive, setLinkActive] = useState(false);
  const [secretLink, setSecretLink] = useState<string | null>(null);

  const copyLinkStyles = useSpring({
    from: { height: 0, opacity: 0 },
    to: { height: linkActive ? 40 : 0, opacity: linkActive ? 1 : 0 },
  });

  const toggleSwitch = async () => {
    try {
      // TODO: Handle error states and hook up to api
      setLinkActive(!linkActive);
      setSecretLink('test link');
    } catch (err) {}
  };

  const onCopyPressed = async () => {
    // TODO: Handle error states and hook up to api
    try {
      if (secretLink) {
        await navigator.clipboard.writeText('Put link here!');
        enqueueSnackbar(t('features.roomControls.copySuccess'), { variant: 'success' });
      }
    } catch (err) {}
  };

  const onResetLinkPressed = async () => {
    try {
      // TOOD: hookup api and handle error state, show fail toast?
      enqueueSnackbar(t('features.roomControls.inviteLinkReset'), { variant: 'success' });
    } catch (err) {}
  };

  return (
    <Box
      className={clsx(classes.root, {
        [classes.inactive]: !linkActive,
        [classes.active]: linkActive,
      })}
    >
      <Box display="flex" flexDirection="row" mb={1}>
        {isRoomOwner && linkActive ? (
          <Typography variant="body1" component={'span'}>
            <Trans i18nKey="features.roomControls.linkInviteResetText">
              You can reset
              <Button
                className={classes.resetLink}
                onClick={onResetLinkPressed}
                fullWidth={false}
                style={{ backgroundColor: 'transparent' }}
              >
                this link
              </Button>
              to generate a new invite link.
            </Trans>
          </Typography>
        ) : (
          <Typography variant="body1">{t('features.roomControls.linkInviteToggleText')}</Typography>
        )}
        <Switch
          disabled={!linkActive && !isRoomOwner}
          checked={linkActive}
          onChange={toggleSwitch}
          name="toggle-invite-link"
          inputProps={{ 'aria-label': t('features.roomControls.linkInviteAriaLabel') }}
        />
      </Box>
      <animated.div style={copyLinkStyles as any}>
        <Button
          color="default"
          onClick={onCopyPressed}
          fullWidth
          aria-label={t('features.roomControls.copyLinkButtonAria')}
        >
          {t('features.roomControls.CopyLinkButtonText')}
        </Button>
      </animated.div>
      <Box className={classes.explanationTextWrapper}>
        <Typography variant="body2" className={classes.explanationText}>
          {t(`features.roomControls.${!isRoomOwner && !linkActive ? 'guestExplanation' : 'linkInviteExplanation'}`)}
        </Typography>
      </Box>
    </Box>
  );
});
