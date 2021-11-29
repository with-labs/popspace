import { useAvatarBackgroundColor } from '@components/Avatar/useAvatarBackgroundColor';
import { MuteIconSmall } from '@components/icons/MuteIconSmall';
import { Box, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

import { INITIAL_SIZE_VIDEO, SIZE_AVATAR } from './constants';
import { PersonBubbleAvatar } from './PersonBubbleAvatar';
import { PersonBubbleBackground } from './PersonBubbleBackground';
import { PersonBubbleContent } from './PersonBubbleContent';
import { PersonBubbleFrame } from './PersonBubbleFrame';
import { PersonBubbleLabel } from './PersonBubbleLabel';
import { PersonBubbleVoiceIndicator } from './PersonBubbleVoiceIndicator';

interface IPseudoUserBubbleProps {
  isVideoOn?: boolean;
  isMicOn?: boolean;
  className?: string;
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
    fontWeight: theme.typography.fontWeightMedium as any,
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
  userData,
  ...rest
}) => {
  const classes = useStyles();

  const { avatarName, displayName, userId } = userData;
  const backgroundColor = useAvatarBackgroundColor(avatarName);

  return (
    <PersonBubbleFrame
      isVideoOn={isVideoOn}
      className={clsx(classes.root, isVideoOn && classes.rootVideo, className)}
      {...rest}
    >
      <PersonBubbleContent isVideoOn={isVideoOn}>
        <PersonBubbleBackground isVideoOn={isVideoOn} backgroundColor={backgroundColor}>
          {isVideoOn && <Box className={classes.video}>{children}</Box>}
        </PersonBubbleBackground>
        {!isVideoOn && <PersonBubbleAvatar isSpeaking={false} userId={userId} avatarName={avatarName} />}
        <PersonBubbleLabel isVideoOn={isVideoOn}>
          <Typography className={classes.name}>{displayName}</Typography>
        </PersonBubbleLabel>
        <PersonBubbleVoiceIndicator isVideoOn={isVideoOn}>
          {!isMicOn ? <MuteIconSmall className={classes.mutedIcon} fontSize="inherit" /> : null}
        </PersonBubbleVoiceIndicator>
      </PersonBubbleContent>
    </PersonBubbleFrame>
  );
};
