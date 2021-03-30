import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { useAddAccessory } from '../../roomControls/addContent/quickActions/useAddAccessory';
import { useRoomViewport } from '../RoomViewport';
import { FullscreenableMedia } from '../../../components/FullscreenableMedia/FullscreenableMedia';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import { SPRINGS } from '../../../constants/springs';
import { makeStyles, Box, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import { GrabbyIcon } from '../../../components/icons/GrabbyIcon';
import { WidgetType } from '../../../roomState/types/widgets';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { Stream } from '../../../types/streams';
import { getTrackName, hasTrackName } from '../../../utils/trackNames';

/**
 * number of screen-space pixels you need to drag it away
 * from where it started to register a 'tear off'
 */
const TEAR_THRESHOLD = 100;

export interface ISidecarStreamPreviewProps {
  userId: string;
  className?: string;
  stream: Stream;
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    background: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: theme.palette.grey[900],
    boxShadow: theme.mainShadows.surface,
    fontSize: 18,
  },
  screenSharePlaceholder: {
    fontSize: 18,
    padding: 4,
  },
  screenShareContainer: {
    overflow: 'hidden',
    height: '100%',
  },
  screenShare: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  screenShareFullscreen: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
  grabIcon: {
    width: 16,
    height: 24,
  },
}));

/**
 * This is a small screenshare video which can be "torn off" - grabbed and dragged
 * enough away from its starting position - which will then spawn a screen share accessory.
 */
export const SidecarStreamPreview = React.memo(
  React.forwardRef<HTMLDivElement, ISidecarStreamPreviewProps>(({ userId, stream, ...rest }, ref) => {
    const classes = useStyles();
    const theme = useTheme();

    const { videoPublication, audioPublication } = stream;

    // using Twilio IDs to compare ownership
    const localParticipant = useLocalParticipant();
    const isLocal = userId === useCurrentUserProfile().user?.id;

    const addWidget = useAddAccessory();
    const viewport = useRoomViewport();

    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const onFullscreenExit = () => setIsFullscreen(false);

    // hide the preview when a widget is out in the room for this stream
    const hasWidgetInRoom = useRoomStore((room) => {
      const userWidgets = Object.values(room.widgets).filter((w) => w.ownerId === userId);
      return userWidgets.some((w) => {
        if (w.type !== WidgetType.SidecarStream) return false;
        return (
          w.widgetState.twilioParticipantIdentity === stream.participantIdentity &&
          (!stream.videoPublication || hasTrackName(stream.videoPublication, w.widgetState.videoTrackName)) &&
          (!stream.audioPublication || hasTrackName(stream.audioPublication, w.widgetState.audioTrackName))
        );
      });
    });

    const [rootStyles, rootSpring] = useSpring(() => ({
      x: 0,
      y: 0,
      display: hasWidgetInRoom ? 'none' : 'flex',
      cursor: 'pointer',
      config: SPRINGS.RESPONSIVE,
    }));

    const [videoStyles, videoSpring] = useSpring(() => ({
      scale: 1,
      boxShadow: 'none',
      borderRadius: theme.shape.innerBorderRadius,
    }));

    // when the the pop-out accessory is created or destroyed, show/hide the preview
    React.useEffect(() => {
      rootSpring.start({
        display: hasWidgetInRoom ? 'none' : 'flex',
      });
      videoSpring.start({
        // reset scale
        scale: 1,
      });
    }, [hasWidgetInRoom, rootSpring, videoSpring]);

    const bind = useGesture(
      {
        onDrag: (ev) => {
          ev.event?.stopPropagation();
          if (isLocal) {
            rootSpring.start({
              // dividing by viewport zoom corrects the offset according to
              // the zoom value
              x: ev.movement[0] / viewport.getZoom(),
              y: ev.movement[1] / viewport.getZoom(),
              cursor: 'grabbing',
            });
            videoSpring.start({
              // a visual indicator for the user of the tear-off action intention
              scale: ev.distance > TEAR_THRESHOLD ? 3 : 1,
              boxShadow: theme.mainShadows.surface,
              borderRadius: theme.shape.contentBorderRadius,
            });
          }
        },
        onDragStart: (ev) => {
          ev.event?.stopPropagation();
          viewport.onObjectDragStart();
        },
        onDragEnd: (ev) => {
          function returnToNeutral() {
            // return to neutral position
            rootSpring.start({
              x: 0,
              y: 0,
            });
            videoSpring.start({
              scale: 1,
              boxShadow: 'none',
              borderRadius: theme.shape.innerBorderRadius,
            });
          }

          ev.event?.stopPropagation();
          viewport.onObjectDragEnd();
          if (isLocal && ev.distance > TEAR_THRESHOLD && localParticipant) {
            addWidget({
              type: WidgetType.SidecarStream,
              initialData: {
                twilioParticipantIdentity: stream.participantIdentity,
                videoTrackName: getTrackName(videoPublication) ?? undefined,
                audioTrackName: getTrackName(audioPublication) ?? undefined,
              },
              screenCoordinate: {
                x: ev.xy[0],
                y: ev.xy[1],
              },
            });
            // after a delay, return to neutral position - give the
            // server time to create the widget
            setTimeout(returnToNeutral, 500);
          } else {
            // if it was a tap, trigger fullscreen
            if (ev.tap) {
              setIsFullscreen(true);
            }
            returnToNeutral();
          }
        },
      },
      {
        eventOptions: {
          capture: true,
        },
        drag: {
          initial: [0, 0],
        },
      }
    );

    return (
      <animated.div
        ref={ref}
        style={rootStyles as any}
        {...rest}
        className={clsx(classes.root, rest.className)}
        {...bind()}
      >
        {isLocal && <GrabbyIcon fontSize="inherit" color="inherit" className={classes.grabIcon} />}
        <Box
          component={animated.div}
          flex={1}
          margin="auto"
          style={videoStyles as any}
          className={classes.screenShareContainer}
        >
          <FullscreenableMedia
            id={`sidecar-${stream.id}`}
            isFullscreen={isFullscreen}
            onFullscreenExit={onFullscreenExit}
            className={clsx(classes.screenShare, isFullscreen && classes.screenShareFullscreen)}
            placeholderClassName={classes.screenSharePlaceholder}
            objectId={userId}
            muted={!isFullscreen}
            videoPublication={videoPublication ?? null}
            audioPublication={audioPublication ?? null}
          />
        </Box>
      </animated.div>
    );
  })
);
