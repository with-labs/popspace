import React, { useState, useRef, forwardRef } from 'react';
import {
  IconButton,
  makeStyles,
  Box,
  Switch,
  Typography,
  FilledInput,
  InputAdornment,
  Button,
} from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import clsx from 'clsx';
import { CopyIcon } from '../../../components/icons/CopyIcon';
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
  linkField: {
    backgroundColor: theme.palette.brandColors.snow.regular,
    '&:hover': {
      backgroundColor: theme.palette.brandColors.snow.regular,
    },
  },
}));

export const InviteLink = forwardRef<HTMLDivElement, IInviteLinkProps>((props, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const copyLinkRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const isRoomOwner = useIsRoomOwner();

  const [linkActive, setLinkActive] = useState(false);

  const copyLinkStyles = useSpring({
    from: { height: 0, opacity: 0 },
    to: { height: linkActive ? 40 : 0, opacity: linkActive ? 1 : 0 },
  });

  const onCopyPressed = async () => {
    try {
      await navigator.clipboard.writeText('Put link here!');
      enqueueSnackbar(t('features.roomControls.copySuccess'), { variant: 'success' });
    } catch (err) {
      // TODO: handle error case
      console.log(err);
    }
  };

  const onResetLinkPressed = () => {};

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
          onChange={() => setLinkActive(!linkActive)}
          name="toggle-invite-link"
          inputProps={{ 'aria-label': t('features.roomControls.linkInviteAriaLabel') }}
        />
      </Box>
      <animated.div style={copyLinkStyles as any}>
        <FilledInput
          ref={copyLinkRef}
          id="invite-link"
          defaultValue="Hello World"
          readOnly
          classes={{ root: classes.linkField }}
          fullWidth
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={t('features.status.altClearButton')}
                onClick={onCopyPressed}
                edge="end"
                size="small"
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          }
        />
      </animated.div>
      <Box className={classes.explanationTextWrapper}>
        <Typography variant="body2" className={classes.explanationText}>
          {t(`features.roomControls.${!isRoomOwner && !linkActive ? 'guestExplanation' : 'linkInviteExplanation'}`)}
        </Typography>
      </Box>
    </Box>
  );
});
