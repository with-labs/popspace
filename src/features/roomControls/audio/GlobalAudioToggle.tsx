import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { DropdownIcon } from '@components/icons/DropdownIcon';
import { HearingIcon } from '@components/icons/HearingIcon';
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover';
import { Spacing } from '@components/Spacing/Spacing';
import {
  Button,
  ButtonProps,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  makeStyles,
  Typography,
} from '@material-ui/core';
import globalAudioOffVideo from '@src/videos/global_audio/global-off.mp4';
import globalAudioOnVideo from '@src/videos/global_audio/global-on.mp4';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  button: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    height: 48,
    color: theme.palette.grey[900],
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-start',
      minWidth: 150,
    },
  },
  text: {
    color: theme.palette.brandColors.ink.regular,
    paddingLeft: theme.spacing(1),
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
  container: {
    width: '100%',
    padding: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      width: 380,
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
    setTargetEl(null); // close popout
  };

  return (
    <>
      <Button
        fullWidth={false}
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
        <Spacing flexDirection="column" className={classes.container}>
          <Typography variant="h2">{t('features.mediaControls.globalAudioTitle')}</Typography>
          <AudioToggleCard
            title={t('features.mediaControls.globalAudioOnTitle')}
            description={t('features.mediaControls.globalAudioOnDescription')}
            videoSrc={globalAudioOnVideo}
            selected={isGlobalAudioOn}
            onClick={toggleGlobalAudio}
          />
          <AudioToggleCard
            title={t('features.mediaControls.globalAudioOffTitle')}
            description={t('features.mediaControls.globalAudioOffDescription')}
            videoSrc={globalAudioOffVideo}
            selected={!isGlobalAudioOn}
            onClick={toggleGlobalAudio}
          />
        </Spacing>
      </ResponsivePopover>
    </>
  );
}

const useCardStyles = makeStyles((theme) => ({
  card: {
    overflow: 'visible',
  },
  selected: {
    boxShadow: theme.focusRings.create(theme.palette.brandColors.lavender.bold, true),
  },
  video: {
    height: 'auto',
    width: '100%',
  },
}));

function AudioToggleCard({
  selected,
  description,
  videoSrc,
  title,
  onClick,
  ...props
}: {
  selected: boolean;
  title: string;
  description: string;
  videoSrc: string;
  onClick: () => void;
}) {
  const classes = useCardStyles();

  return (
    <Card className={clsx(classes.card, selected && classes.selected)} {...props}>
      <CardActionArea disabled={selected} onClick={onClick}>
        <CardMedia>
          <video src={videoSrc} className={classes.video} autoPlay loop muted playsInline />
        </CardMedia>
        <CardContent>
          <Typography variant="h3">{title}</Typography>
          <Typography>{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
