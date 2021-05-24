import React from 'react';
import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import { useAvatar } from '../../../hooks/useAvatar/useAvatar';
import { MuteIconSmall } from '../../../components/icons/MuteIconSmall';
import { PersonBubbleFrame } from './PersonBubbleFrame';
import { PersonBubbleContent } from './PersonBubbleContent';
import { PersonBubbleBackground } from './PersonBubbleBackground';
import { PersonBubbleLabel } from './PersonBubbleLabel';
import { PersonBubbleVoiceIndicator } from './PersonBubbleVoiceIndicator';
import { PersonBubbleAvatar } from './PersonBubbleAvatar';
import { AwayIcon } from '../../../components/icons/AwayIcon';
import clsx from 'clsx';
import { INITIAL_SIZE_VIDEO, SIZE_AVATAR } from './constants';

interface IPseudoUserBubbleProps {
  isVideoOn?: boolean;
  isMicOn?: boolean;
  className?: string;
  isAway?: boolean;
  userData: { userId: string; avatarName: string; displayName: string };
}

const useStyles = makeStyles((theme) => ({
  root: {
    ...SIZE_AVATAR,
    transition: theme.transitions.create(['width', 'height']),
  },
  rootVideo: {
    ...INITIAL_SIZE_VIDEO,
  },
  mainContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  background: {
    width: '100%',
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  bottomSection: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightMedium,
    textOverflow: 'ellipsis',
    margin: '0 auto',
    maxWidth: '70%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    transform: 'rotateY(180deg)',
  },
  voiceIndicator: {
    bottom: -8,
    position: 'absolute',
    transform: 'translate(50%, -50%)',
  },
  mutedIcon: {
    width: 16,
    height: 16,
    fontSize: theme.typography.pxToRem(16),
    color: theme.palette.brandColors.cherry.bold,
  },
  awayIcon: {
    width: 20,
    height: 20,
    position: 'relative',
    top: 4,
    fontSize: theme.typography.pxToRem(20),
    // TODO: better color palettes - this is blueberry vibrant
    color: '#65B2E2',
  },
}));

/**
 * A 'fake' PersonBubble which only renders display properties for a user without
 * interactivity.
 */
export const PseudoUserBubble: React.FC<IPseudoUserBubbleProps> = ({
  isVideoOn = false,
  className,
  children,
  isMicOn = false,
  isAway,
  userData,
  ...rest
}) => {
  const theme = useTheme();
  const classes = useStyles();

  const { avatarName, displayName, userId } = userData;
  const { backgroundColor } = useAvatar(avatarName) ?? { backgroundColor: theme.palette.grey[50] };

  return (
    <PersonBubbleFrame
      isVideoOn={isVideoOn}
      className={clsx(classes.root, isVideoOn && classes.rootVideo, className)}
      {...rest}
    >
      <PersonBubbleContent isVideoOn={isVideoOn}>
        <PersonBubbleBackground isVideoOn={isVideoOn} grayscale={isAway} backgroundColor={backgroundColor}>
          {isVideoOn && <Box className={classes.video}>{children}</Box>}
        </PersonBubbleBackground>
        {!isVideoOn && (
          <PersonBubbleAvatar
            grayscale={isAway}
            userId={userId}
            avatarName={avatarName}
            freeze={isAway ? 'eyesClosed' : false}
          />
        )}
        <PersonBubbleLabel isVideoOn={isVideoOn}>
          <Typography className={classes.name}>{displayName}</Typography>
        </PersonBubbleLabel>
        <PersonBubbleVoiceIndicator isVideoOn={isVideoOn}>
          {isAway ? (
            <AwayIcon className={classes.awayIcon} fontSize="inherit" />
          ) : !isMicOn ? (
            <MuteIconSmall className={classes.mutedIcon} fontSize="inherit" />
          ) : null}
        </PersonBubbleVoiceIndicator>
      </PersonBubbleContent>
    </PersonBubbleFrame>
  );
};
