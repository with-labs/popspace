import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { DropdownIcon } from '@components/icons/DropdownIcon';
import { HearingIcon } from '@components/icons/HearingIcon';
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover';
import { Spacing } from '@components/Spacing/Spacing';
import { Box, Button, ButtonProps, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  button: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    height: 48,
    color: theme.palette.grey[900],
  },
  text: {
    color: theme.palette.brandColors.ink.regular,
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export function GlobalAudioToggle({ className, ...props }: ButtonProps) {
  const { t } = useTranslation();
  const classes = useStyles();

  const [targetEl, setTargetEl] = React.useState<HTMLButtonElement | null>(null);

  const isGlobalAudioOn = useRoomStore((room) => room.state.isAudioGlobal);
  const toggleGlobalAudio = () => {
    client.roomState.setIsAudioGlobal(!isGlobalAudioOn);
    // close the modal
    setTargetEl(null);
  };

  return (
    <>
      <Button
        onClick={(ev) => setTargetEl(ev.currentTarget)}
        className={clsx(classes.button, className)}
        variant="text"
        endIcon={<DropdownIcon />}
        {...props}
      >
        <HearingIcon fontSize="default" color="inherit" />
        <span className={classes.text}>
          {t(isGlobalAudioOn ? 'features.mediaControls.globalAudioOn' : 'features.mediaControls.globalAudioOff')}
        </span>
      </Button>
      <ResponsivePopover open={!!targetEl} anchorEl={targetEl} onClose={() => setTargetEl(null)}>
        <Spacing flexDirection="column" minWidth={328}>
          <Box bgcolor="grey.100" width="100%" height={178} />
          <Typography variant="h2" gutterBottom>
            {t(
              isGlobalAudioOn
                ? 'features.mediaControls.globalAudioOnTitle'
                : 'features.mediaControls.globalAudioOffTitle'
            )}
          </Typography>
          <Typography>
            {t(
              isGlobalAudioOn
                ? 'features.mediaControls.globalAudioOnDescription'
                : 'features.mediaControls.globalAudioOffDescription'
            )}
          </Typography>
          <Button onClick={toggleGlobalAudio}>
            {t(
              isGlobalAudioOn ? 'features.mediaControls.globalAudioOffCta' : 'features.mediaControls.globalAudioOnCta'
            )}
          </Button>
        </Spacing>
      </ResponsivePopover>
    </>
  );
}
