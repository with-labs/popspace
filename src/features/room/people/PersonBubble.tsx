import * as React from 'react';
import { makeStyles, Typography, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import Publication from '../../../components/Publication/Publication';
import { useSpring, animated } from '@react-spring/web';
import { useAvatar } from '../../../hooks/useAvatar/useAvatar';
import { PersonStatus } from './PersonStatus';
import { SidecarStreamPreview } from './SidecarStreamPreview';
import { DraggableHandle } from '../DraggableHandle';
import { isMobileOnly } from 'react-device-detect';
import { AudioIndicator } from '../../../components/AudioIndicator/AudioIndicator';
import { useSpeakingStates } from '../../../hooks/useSpeakingStates/useSpeakingStates';
import { MuteIconSmall } from '../../../components/icons/MuteIconSmall';
import { RoomUserStateShape } from '../../../roomState/useRoomStore';
import { Stream } from '../../../types/streams';
import { PersonAvatar } from './PersonAvatar';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';

const EXPANDED_SIZE = 280;
const SMALL_SIZE = 140;
const VOICE_ICON_SPRINGS = {
  VISIBLE: {
    mass: 0.5,
    tension: 700,
    friction: 20,
  },
  INVISIBLE: {
    mass: 0.1,
    tension: 800,
    friction: 30,
  },
};

export interface IPersonBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  isMe: boolean;
  person: RoomUserStateShape;
  mainStream: Stream | null;
  sidecarStreams: Stream[];
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
    overflow: 'hidden',
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
    maxWidth: '70%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
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
  voiceWave: {
    width: 24,
    height: 24,
    position: 'relative',
    // tweak to visually align it with mute icon
    top: 7,
  },
}));

/**
 * Renders the 'bubble' which represents a user in the room.
 * TODO: break this component down (both the JSX and the hook logic)
 * so it's easier to read / maintain / reuse pieces
 */
export const PersonBubble = React.forwardRef<HTMLDivElement, IPersonBubbleProps>(
  ({ isMe: isLocal, person, mainStream, sidecarStreams, ...rest }, ref) => {
    const classes = useStyles();
    const theme = useTheme();

    // tracking hover state to show status editing
    const [isHovered, setIsHovered] = React.useState(false);
    const onHover = React.useCallback(() => setIsHovered(true), []);
    const onUnHover = React.useCallback(() => setIsHovered(false), []);

    // some basic checks for how we should render media
    const isVideoOn = !!mainStream?.videoPublication;
    const isMicOn = !!mainStream?.audioPublication;
    const hasSidecars = !!sidecarStreams.length;

    // track speaking state for the Twilio participant represented by the main stream
    const mainStreamParticipantIdentity = mainStream?.participantIdentity;
    const isSpeaking = useSpeakingStates(
      React.useCallback(
        (store) => (mainStreamParticipantIdentity ? !!store.isSpeaking[mainStreamParticipantIdentity] : false),
        [mainStreamParticipantIdentity]
      )
    );

    // extract data from our With backend user
    const userId = person?.id;
    const emoji = person?.participantState.emoji;
    const statusText = person?.participantState.statusText;
    const displayIdentity = person?.participantState.displayName;
    const avatarName = person?.participantState.avatarName;

    // determine background color based on avatar
    const { backgroundColor } = useAvatar(avatarName) ?? { backgroundColor: theme.palette.grey[50] };

    // this spring animates the outer bubble container
    const rootStyles = useSpring({
      borderRadius: isVideoOn ? 32 : '100%',
      width: isVideoOn ? EXPANDED_SIZE : SMALL_SIZE,
      height: isVideoOn ? EXPANDED_SIZE : SMALL_SIZE,
    });

    // this spring animates the main internal layout structure
    const mainContentStyles = useSpring({
      // reduce border radius to align based on border width
      borderRadius: isVideoOn ? 28 : '100%',
    });

    // this spring animates the video / avatar container and background
    const graphicStyles = useSpring({
      height: isVideoOn ? EXPANDED_SIZE - 32 : SMALL_SIZE - 49,
      backgroundColor,
    });

    // this spring animates the speaking indicator position as the
    // bubble transitions from video to avatar
    const [speakingIndicatorStyles, setSpeakingIndicatorStyles] = useSpring(() => ({
      right: isVideoOn ? '8%' : '50%',
      bottom: isVideoOn ? -10 : -8,
      opacity: 1,
      config: VOICE_ICON_SPRINGS.VISIBLE,
    }));

    // scripted animation for the transition to and from video for the speaking indicator
    // graphic - this makes the transition of the position of the icon feel less
    // awkward by hiding it while it moves, popping it in later
    React.useEffect(() => {
      (async function () {
        if (isVideoOn) {
          await setSpeakingIndicatorStyles({ opacity: 0, config: VOICE_ICON_SPRINGS.VISIBLE });
          await setSpeakingIndicatorStyles({
            right: '8%',
            bottom: -20,
            // modify spring for this operation - the icon is invisible at this point
            // we just want this to move quickly to the next position
            config: VOICE_ICON_SPRINGS.INVISIBLE,
          });
          await setSpeakingIndicatorStyles({ opacity: 1, bottom: -10, config: VOICE_ICON_SPRINGS.VISIBLE });
        } else {
          await setSpeakingIndicatorStyles({ opacity: 0, config: VOICE_ICON_SPRINGS.VISIBLE });
          await setSpeakingIndicatorStyles({
            right: '50%',
            bottom: -18,
            // modify spring for this operation - the icon is invisible at this point
            // we just want this to move quickly to the next position
            config: VOICE_ICON_SPRINGS.INVISIBLE,
          });
          await setSpeakingIndicatorStyles({ opacity: 1, bottom: -8, config: VOICE_ICON_SPRINGS.VISIBLE });
        }
      })();
    }, [isVideoOn, setSpeakingIndicatorStyles]);

    // this spring animates the display name
    const bottomSectionStyles = useSpring({
      lineHeight: '1',
      height: isVideoOn ? 24 : 16,
    });

    // this spring animates the status indicator
    const statusStyles = useSpring({
      left: isVideoOn ? 8 : 16,
      top: isVideoOn ? 8 : 0,
      x: isVideoOn ? '0%' : '-100%',
    });

    // we only activate hover effects if the user isn't on mobile
    const handlers = isMobileOnly
      ? {}
      : {
          onPointerEnter: onHover,
          onPointerLeave: onUnHover,
        };

    return (
      <animated.div
        {...rest}
        ref={ref}
        className={clsx(classes.root, rest.className)}
        style={rootStyles as any}
        data-test-person={displayIdentity}
        {...handlers}
      >
        <DraggableHandle disabled={!isLocal} className={classes.handle}>
          <animated.div className={classes.mainContent} style={mainContentStyles}>
            {/* Still a typing issue with react-spring :( */}
            <animated.div className={classes.background} style={graphicStyles as any}>
              {mainStream?.videoPublication && (
                <Publication
                  classNames={classes.video}
                  publication={mainStream.videoPublication}
                  isLocal={isLocal}
                  objectId={userId}
                  objectKind="user"
                />
              )}
            </animated.div>
            {!mainStream?.videoPublication && <PersonAvatar className={classes.avatar} personId={userId} />}
            {mainStream?.audioPublication && (
              <Publication
                classNames={classes.audio}
                publication={mainStream?.audioPublication}
                isLocal={isLocal}
                objectId={userId}
                objectKind="user"
                disableAudio={isLocal}
              />
            )}
            <animated.div className={clsx(classes.bottomSection)} style={bottomSectionStyles}>
              <Typography className={classes.name}>{displayIdentity}</Typography>
            </animated.div>
            <animated.div className={classes.voiceIndicator} style={speakingIndicatorStyles as any}>
              {isMicOn ? (
                <AudioIndicator className={classes.voiceWave} isActive={isSpeaking} variant="sine" />
              ) : (
                <MuteIconSmall className={classes.mutedIcon} fontSize="inherit" />
              )}
            </animated.div>
          </animated.div>
        </DraggableHandle>
        <animated.div className={classes.status} style={statusStyles}>
          <PersonStatus emoji={emoji} status={statusText} isParentHovered={isHovered} isLocal={isLocal} />
        </animated.div>
        {hasSidecars && (
          <div className={classes.screenSharePreviewContainer}>
            {sidecarStreams.map((stream) => (
              <SidecarStreamPreview
                userId={userId}
                className={classes.screenSharePreview}
                stream={stream}
                key={stream.id}
              />
            ))}
          </div>
        )}
      </animated.div>
    );
  }
);
