import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { Spacing, SpacingProps } from '@components/Spacing/Spacing';
import { Box, Card, CardActionArea, CardContent, CardMedia, makeStyles, Typography } from '@material-ui/core';
import globalAudioOnVideo from '@src/videos/global_audio/global.mp4';
import globalAudioOffVideo from '@src/videos/global_audio/nearby.mp4';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function GlobalAudioToggle(props: SpacingProps) {
  const { t } = useTranslation();

  const isGlobalAudioOn = useRoomStore((room) => room.state.isAudioGlobal);

  return (
    <Spacing {...props}>
      <AudioToggleCard
        title={t('features.mediaControls.globalAudioOffTitle')}
        description={t('features.mediaControls.globalAudioOffDescription')}
        videoSrc={globalAudioOffVideo}
        selected={!isGlobalAudioOn}
        onClick={() => client.roomState.setIsAudioGlobal(false)}
      />
      <AudioToggleCard
        title={t('features.mediaControls.globalAudioOnTitle')}
        description={t('features.mediaControls.globalAudioOnDescription')}
        videoSrc={globalAudioOnVideo}
        selected={isGlobalAudioOn}
        onClick={() => client.roomState.setIsAudioGlobal(true)}
      />
    </Spacing>
  );
}

const useCardStyles = makeStyles((theme) => ({
  card: {
    overflow: 'visible',
    border: '1px solid',
    borderColor: theme.palette.grey[500],
  },
  selected: {
    boxShadow: theme.focusRings.create(theme.palette.brandColors.lavender.bold, true),
  },
  video: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  textContent: {
    padding: theme.spacing(4),
    backgroundColor: theme.palette.common.white,
    flex: '1 0 auto',
  },
  videoContent: {
    flex: '1 1 auto',
    minHeight: 0,
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
      <CardActionArea disabled={selected} onClick={onClick} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <CardMedia className={classes.videoContent}>
            <video src={videoSrc} className={classes.video} autoPlay loop muted playsInline />
          </CardMedia>
          <CardContent className={classes.textContent}>
            <Typography variant="h3">{title}</Typography>
            <Typography>{description}</Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
