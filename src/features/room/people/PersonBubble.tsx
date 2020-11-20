import * as React from 'react';
import { LocalParticipant, RemoteParticipant, RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';
import { makeStyles, Typography, useTheme } from '@material-ui/core';
import useParticipantDisplayIdentity from '../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import clsx from 'clsx';
import Publication from '../../../components/Publication/Publication';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useSpring, animated, config } from '@react-spring/web';
import { PersonState } from '../../../types/room';
import { useAvatar } from '../../../hooks/useAvatar/useAvatar';
import { MicOffIcon } from '../../../components/icons/MicOffIcon';
import { PersonStatus } from './PersonStatus';
import { ScreenSharePreview } from './ScreenSharePreview';
import { DraggableHandle } from '../DraggableHandle';

const EXPANDED_SIZE = 280;
const SMALL_SIZE = 140;

export interface IPersonBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  participant: LocalParticipant | RemoteParticipant;
  isLocal: boolean;
  person: PersonState;
  audioTrack: RemoteTrackPublication | LocalTrackPublication | null;
  cameraTrack: RemoteTrackPublication | LocalTrackPublication | null;
  screenShareTrack: RemoteTrackPublication | LocalTrackPublication | null;
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
  handle: {
    overflow: 'hdiden',
    width: '100%',
    height: '100%',
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
    borderRadius: theme.shape.borderRadius,
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
    overflow: 'hidden',
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
  screenSharePreviewContainer: {
    position: 'absolute',
    bottom: 48,
    transform: 'translateX(-50%)',
    zIndex: 1,
    minWidth: 24,
    maxWidth: 72,
    height: 40,
    overflow: 'visible',
  },
  screenSharePreview: {
    border: `2px solid ${theme.palette.background.paper}`,
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
    const isMicOn = !!audioTrack;
    const isSharingScreen = !!screenShareTrack;

    const { avatar: avatarName, isSpeaking, emoji, status } = person ?? {};

    // visible screen name
    const displayIdentity = useParticipantDisplayIdentity(participant);

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
        data-test-person={displayIdentity}
      >
        <DraggableHandle disabled={!isLocal} className={classes.handle}>
          <animated.div className={classes.mainContent} style={mainContentStyles}>
            {/* Still a typing issue with react-spring :( */}
            <animated.div className={classes.background} style={graphicStyles as any}>
              {cameraTrack && (
                <Publication
                  classNames={classes.video}
                  publication={cameraTrack}
                  isLocal={isLocal}
                  objectId={participant.sid}
                />
              )}
            </animated.div>
            {!cameraTrack && <Avatar className={classes.avatar} name={avatarName} />}
            {audioTrack && (
              <Publication
                classNames={classes.audio}
                publication={audioTrack}
                isLocal={isLocal}
                objectId={participant.sid}
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
        </DraggableHandle>
        <animated.div className={classes.status} style={statusStyles}>
          <PersonStatus
            personId={person.id}
            emoji={emoji}
            status={status}
            isParentHovered={isHovered}
            isLocal={isLocal}
          />
        </animated.div>
        {isSharingScreen && (
          <div className={classes.screenSharePreviewContainer}>
            <ScreenSharePreview participantSid={participant.sid} className={classes.screenSharePreview} />
          </div>
        )}
      </animated.div>
    );
  }
);
