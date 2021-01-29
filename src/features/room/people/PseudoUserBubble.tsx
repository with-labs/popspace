import React from 'react';
import clsx from 'clsx';
import { Box, makeStyles, Typography, useTheme } from '@material-ui/core';
import { useSpring, animated } from '@react-spring/web';
import { PersonAvatar } from '../../room/people/PersonAvatar';
import { useAvatar } from '../../../hooks/useAvatar/useAvatar';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { MuteIconSmall } from '../../../components/icons/MuteIconSmall';

const EXPANDED_SIZE = 280;
const SMALL_SIZE = 140;
interface IPseudoUserBubbleProps {
  userId?: string;
  isVideoOn: boolean;
  isMicOn: boolean;
  className?: string;
  useLargeDisplay?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: `4px solid ${theme.palette.background.paper}`,
    transition: theme.transitions.create('border-color'),
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.mainShadows.surface,
  },
  mainContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  avatar: {
    width: '100%',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 41,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
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
  handle: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    transform: 'rotateY(180deg)',
  },
  largeDisplay: {
    width: '100%',
    height: '100%',
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
}));

export const PseudoUserBubble: React.FC<IPseudoUserBubbleProps> = (props) => {
  const { userId = '', isVideoOn, className, children, useLargeDisplay = false, isMicOn } = props;
  const theme = useTheme();
  const classes = useStyles();

  const person = useRoomStore((room) => room.users[userId ?? '']);
  const { avatarName } = person?.participantState;
  const displayIdentity = person?.participantState.displayName;

  const { backgroundColor } = useAvatar(avatarName) ?? { backgroundColor: theme.palette.grey[50] };
  // this spring animates the outer bubble container
  const rootStyles = useSpring({
    borderRadius: isVideoOn || useLargeDisplay ? 32 : '100%',
    width: isVideoOn || useLargeDisplay ? EXPANDED_SIZE : SMALL_SIZE,
    height: isVideoOn || useLargeDisplay ? EXPANDED_SIZE : SMALL_SIZE,
  });

  // this spring animates the main internal layout structure
  const mainContentStyles = useSpring({
    // reduce border radius to align based on border width
    borderRadius: isVideoOn || useLargeDisplay ? 28 : '100%',
  });

  // this spring animates the video / avatar container and background
  const graphicStyles = useSpring({
    height: isVideoOn || useLargeDisplay ? EXPANDED_SIZE - 32 : SMALL_SIZE - 49,
    backgroundColor,
  });

  // this spring animates the display name
  const bottomSectionStyles = useSpring({
    lineHeight: '1',
    height: isVideoOn || useLargeDisplay ? 24 : 16,
  });

  const speakingIndicatorStyles = useSpring({
    right: isVideoOn || useLargeDisplay ? '8%' : '50%',
    bottom: isVideoOn || useLargeDisplay ? -10 : -8,
    opacity: 1,
  });

  return (
    <animated.div
      className={clsx(classes.root, className)}
      style={rootStyles as any}
      data-test-person={displayIdentity}
    >
      <Box className={classes.handle}>
        <animated.div className={classes.mainContent} style={mainContentStyles}>
          <animated.div className={classes.background} style={graphicStyles as any}>
            {!isVideoOn && !useLargeDisplay && <PersonAvatar className={classes.avatar} personId={userId} />}
            {isVideoOn && <Box className={classes.video}>{children}</Box>}
            {useLargeDisplay && <Box className={classes.largeDisplay}>{children}</Box>}
          </animated.div>
          <animated.div className={clsx(classes.bottomSection)} style={bottomSectionStyles}>
            <Typography className={classes.name}>{displayIdentity}</Typography>
          </animated.div>
          <animated.div className={classes.voiceIndicator} style={speakingIndicatorStyles as any}>
            {!isMicOn && <MuteIconSmall className={classes.mutedIcon} fontSize="inherit" />}
          </animated.div>
        </animated.div>
      </Box>
    </animated.div>
  );
};
