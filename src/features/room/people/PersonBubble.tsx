import * as React from 'react';
import { LocalParticipant, RemoteParticipant, AudioTrackPublication, VideoTrackPublication } from 'twilio-video';
import { makeStyles, Typography, useTheme } from '@material-ui/core';
import useParticipantDisplayIdentity from '../../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import clsx from 'clsx';
import Publication from '../../../components/Publication/Publication';
import { Avatar } from '../../../withComponents/Avatar/Avatar';
import { ScreenShareButton } from './ScreenShareButton';
import { useSpring, animated, config } from '@react-spring/web';
import useIsTrackEnabled from '../../../hooks/useIsTrackEnabled/useIsTrackEnabled';
import { PersonState } from '../../../types/room';
import { useAvatar } from '../../../withHooks/useAvatar/useAvatar';
import { MicOffIcon } from '../../../withComponents/icons/MicOffIcon';
import { PersonStatus } from './PersonStatus';

const EXPANDED_SIZE = 280;
const SMALL_SIZE = 140;
const AVATAR_SIZE = 130;

export interface IPersonBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  participant: LocalParticipant | RemoteParticipant;
  isLocal: boolean;
  person: PersonState;
  audioTrack?: AudioTrackPublication;
  cameraTrack?: VideoTrackPublication;
  screenShareTrack?: VideoTrackPublication;
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
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  audio: {
    display: 'none',
  },
  avatar: {
    width: '100%',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 41,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  background: {
    width: '100%',
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  status: {
    position: 'absolute',
    zIndex: 1,
  },
  screenShareButton: {
    position: 'absolute',
    bottom: 48,
    transform: 'translateX(-50%)',
    zIndex: 1,
    border: `2px solid ${theme.palette.background.paper}`,
    borderRadius: theme.shape.contentBorderRadius,
    maxWidth: 60,
    overflow: 'hidden',
  },
  screenShare: {
    borderRadius: theme.shape.contentBorderRadius,
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
    maxWidth: '80%',
  },
  mutedGraphic: {
    bottom: 4,
    fontSize: theme.typography.pxToRem(16),
    width: 16,
    height: 16,
    lineHeight: '1',
    position: 'absolute',
  },
  mutedIcon: {
    color: theme.palette.error.dark,
  },
}));

export const PersonBubble = React.forwardRef<HTMLDivElement, IPersonBubbleProps>(
  ({ participant, isLocal, person, audioTrack, cameraTrack, screenShareTrack, ...rest }, ref) => {
    const classes = useStyles();
    const theme = useTheme();

    const [isHovered, setIsHovered] = React.useState(false);
    const onHover = React.useCallback(() => setIsHovered(true), []);
    const onUnHover = React.useCallback(() => setIsHovered(false), []);

    const isVideoOn = !!cameraTrack;

    const { avatar: avatarName, isSpeaking, emoji, status } = person ?? {};

    // visible screen name
    const displayIdentity = useParticipantDisplayIdentity(participant);

    const isMicOn = useIsTrackEnabled(audioTrack?.track);

    const { backgroundColor } = useAvatar(avatarName) ?? { backgroundColor: theme.palette.grey[50] };

    const rootStyles = useSpring({
      borderRadius: isVideoOn ? 32 : '100%',
      width: isVideoOn ? EXPANDED_SIZE : SMALL_SIZE,
      height: isVideoOn ? EXPANDED_SIZE : SMALL_SIZE,
    });

    const mainContentStyles = useSpring({
      // reduce border radius to align based on border width
      borderRadius: isVideoOn ? 28 : '100%',
    });

    // track whether this user is speaking (updated using audio track volume monitoring)
    // this is a separate spring so we can configure the physics to be more responsive
    const speakingRingStyles = useSpring({
      borderColor: isSpeaking && isMicOn ? theme.palette.brandColors.lavender.regular : theme.palette.background.paper,
      config: config.stiff,
    });

    const graphicStyles = useSpring({
      height: isVideoOn ? EXPANDED_SIZE - 32 : SMALL_SIZE - 49,
      backgroundColor,
    });

    const mutedGraphicStyles = useSpring({
      right: isVideoOn ? 16 : 58,
    });

    const bottomSectionStyles = useSpring({
      lineHeight: isVideoOn ? '32px' : '16px',
    });

    const statusStyles = useSpring({
      left: isVideoOn ? 8 : 16,
      top: isVideoOn ? 8 : 0,
      x: isVideoOn ? '0%' : '-100%',
    });

    return (
      <animated.div
        {...rest}
        ref={ref}
        className={clsx(classes.root, rest.className)}
        style={{ ...rootStyles, ...speakingRingStyles } as any}
        onPointerEnter={onHover}
        onPointerLeave={onUnHover}
      >
        <animated.div className={classes.mainContent} style={mainContentStyles}>
          {/* Still a typing issue with react-spring :( */}
          <animated.div className={classes.background} style={graphicStyles as any}>
            {cameraTrack && (
              <Publication
                classNames={classes.video}
                publication={cameraTrack}
                isLocal={isLocal}
                participant={participant}
              />
            )}
          </animated.div>
          {!cameraTrack && <Avatar className={classes.avatar} name={avatarName} size={AVATAR_SIZE} />}
          {audioTrack && (
            <Publication
              classNames={classes.audio}
              publication={audioTrack}
              isLocal={isLocal}
              participant={participant}
              disableAudio={isLocal}
            />
          )}
          <animated.div className={clsx(classes.bottomSection)} style={bottomSectionStyles}>
            <Typography className={classes.name}>{displayIdentity}</Typography>
          </animated.div>
          {!isMicOn && (
            <animated.div className={classes.mutedGraphic} style={mutedGraphicStyles}>
              <MicOffIcon className={classes.mutedIcon} fontSize="inherit" />
            </animated.div>
          )}
        </animated.div>
        {screenShareTrack && !isLocal && (
          <div className={classes.screenShareButton}>
            <ScreenShareButton
              participant={participant}
              mediaTrack={screenShareTrack}
              className={classes.screenShare}
            />
          </div>
        )}
        <animated.div className={classes.status} style={statusStyles}>
          <PersonStatus
            personId={person.id}
            emoji={emoji}
            status={status}
            isParentHovered={isHovered}
            isLocal={isLocal}
          />
        </animated.div>
      </animated.div>
    );
  }
);
