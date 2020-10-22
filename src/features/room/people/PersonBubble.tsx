import * as React from 'react';
import { LocalParticipant, RemoteParticipant, Track, AudioTrackPublication } from 'twilio-video';
import { makeStyles, Typography } from '@material-ui/core';
import usePublications from '../../../hooks/usePublications/usePublications';
import { useLocalParticipant } from '../../../withHooks/useLocalParticipant/useLocalParticipant';
import { useSelector } from 'react-redux';
import { selectors } from '../roomSlice';
import useParticipantDisplayIdentity from '../../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import clsx from 'clsx';
import Publication from '../../../components/Publication/Publication';
import { Avatar } from '../../../withComponents/Avatar/Avatar';
import { Emoji } from 'emoji-mart';
import { ScreenShareButton } from './ScreenShareButton';
import { useSpring, animated, config } from '@react-spring/web';
import palette from '../../../theme/palette';
import useIsTrackEnabled from '../../../hooks/useIsTrackEnabled/useIsTrackEnabled';

export interface IPersonBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  participant: LocalParticipant | RemoteParticipant;
  enableScreenShare?: boolean;
  videoPriority?: Track.Priority;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 160,
    height: 160,
    borderRadius: '100%',
    position: 'relative',
    border: `4px solid ${theme.palette.background.paper}`,
    transition: theme.transitions.create('border-color'),
  },
  mainContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderRadius: '100%',
    pointerEvents: 'none',
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
    width: '60%',
    height: '60%',
    margin: '12% 20% 28% 20%',
    position: 'relative',
  },
  emoji: {
    position: 'absolute',
    width: 32,
    height: 32,
    left: 6,
    top: 6,
    zIndex: 1,
    padding: 4,
    borderRadius: '100%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 0 8px 0 rgba(0,0,0,0.1)',
  },
  screenShare: {
    position: 'absolute',
    left: 0,
    bottom: '30%',
    borderRadius: 6,
    maxWidth: 60,
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  overlayInverted: {
    color: theme.palette.common.white,
    textShadow: '0 0 11px rgba(0,0,0,.5)',
  },
}));

export const PersonBubble = React.forwardRef<HTMLDivElement, IPersonBubbleProps>(
  ({ participant, enableScreenShare, videoPriority, ...rest }, ref) => {
    const classes = useStyles();

    const localParticipant = useLocalParticipant();
    const isLocal = participant.sid === localParticipant.sid;

    // a list of multimedia tracks this user has shared with peers
    const publications = usePublications(participant);

    // Redux data about this user
    const person = useSelector(selectors.createPersonSelector(participant.sid));
    const { emoji, avatar: avatarName, isSpeaking } = person ?? {};

    // visible screen name
    const displayIdentity = useParticipantDisplayIdentity(participant);

    // extract audio and/or video publications
    const audioTrackPub = publications.find((pub) => pub.kind === 'audio') as AudioTrackPublication | undefined;
    const cameraTrackPub = publications.find((pub) => pub.kind === 'video' && pub.trackName.includes('camera'));
    const screenShareTrackPub = publications.find((pub) => pub.kind === 'video' && pub.trackName.includes('screen'));

    const isMicOn = useIsTrackEnabled(audioTrackPub?.track);

    // track whether this user is speaking (updated using audio track volume monitoring)
    const animatedProps = useSpring({
      borderColor: isSpeaking && isMicOn ? palette.lavender.main : palette.snow.main,
      config: config.stiff,
    });

    return (
      <animated.div {...rest} ref={ref} className={clsx(classes.root, rest.className)} style={animatedProps as any}>
        <div className={classes.mainContent}>
          {cameraTrackPub ? (
            <Publication
              classNames={classes.video}
              videoPriority={videoPriority}
              publication={cameraTrackPub}
              isLocal={isLocal}
              participant={participant}
            />
          ) : (
            <Avatar className={classes.avatar} name={avatarName} />
          )}
          {audioTrackPub && (
            <Publication
              classNames={classes.audio}
              publication={audioTrackPub}
              isLocal={isLocal}
              participant={participant}
              disableAudio={isLocal}
            />
          )}
          <div className={clsx(classes.overlay, !!cameraTrackPub && classes.overlayInverted)}>
            <Typography>{displayIdentity}</Typography>
          </div>
        </div>
        {screenShareTrackPub && !isLocal && (
          <ScreenShareButton
            className={classes.screenShare}
            participant={participant}
            mediaTrack={screenShareTrackPub}
          />
        )}
        {emoji && (
          <div className={classes.emoji}>
            <Emoji emoji={emoji} size={24} />
          </div>
        )}
      </animated.div>
    );
  }
);
