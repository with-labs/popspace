import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { useAddAccessory } from '../../roomControls/omnibar/useAddAccessory';
import { WidgetType } from '../../../types/room';
import { useRoomViewport } from '../RoomViewport';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';
import { useSelector } from 'react-redux';
import { ScreenShare } from '../../../components/ScreenShare/ScreenShare';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import { SPRINGS } from '../../../constants/springs';
import { makeStyles, Box, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import { GrabbyIcon } from '../../../components/icons/GrabbyIcon';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { actions } from '../roomSlice';

/**
 * number of screen-space pixels you need to drag it away
 * from where it started to register a 'tear off'
 */
const TEAR_THRESHOLD = 100;

export interface IScreenSharePreviewProps {
  participantSid: string;
  className?: string;
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
  grabIcon: {
    width: 16,
    height: 24,
  },
}));

/**
 * This is a small screenshare video which can be "torn off" - grabbed and dragged
 * enough away from its starting position - which will then spawn a screen share accessory.
 */
export const ScreenSharePreview = React.memo(
  React.forwardRef<HTMLDivElement, IScreenSharePreviewProps>(({ participantSid, ...rest }, ref) => {
    const classes = useStyles();
    const theme = useTheme();

    const localParticipant = useLocalParticipant();
    const isLocal = localParticipant.sid === participantSid;
    const addWidget = useAddAccessory();
    const viewport = useRoomViewport();

    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const onFullscreenExit = () => setIsFullscreen(false);

    // determine if there's already a screenshare widget out there for this user -
    // if there is, we hide this preview - you can only have one of the two at any
    // time. This selector-creator is memoized for efficiency.
    const hasShareAccessorySelector = React.useMemo(
      () =>
        createSelector(
          (state: RootState) => state.room.widgets,
          (_: any, personId: string) => personId,
          (accessories, personId) => {
            return !!Object.values(accessories).find(
              (acc) => acc.type === WidgetType.ScreenShare && acc.participantSid === personId
            );
          }
        ),
      []
    );
    const hasShareAccessory = useSelector((state: RootState) => hasShareAccessorySelector(state, participantSid));

    const coordinatedDispatch = useCoordinatedDispatch();
    const handleStreamEnd = React.useCallback(() => {
      coordinatedDispatch(
        actions.updatePersonIsSharingScreen({
          id: participantSid,
          isSharingScreen: false,
        })
      );
    }, [coordinatedDispatch, participantSid]);

    const [rootStyles, setRootStyles] = useSpring(() => ({
      x: 0,
      y: 0,
      display: hasShareAccessory ? 'none' : 'flex',
      cursor: 'pointer',
      config: SPRINGS.RESPONSIVE,
    }));

    const [videoStyles, setVideoStyles] = useSpring(() => ({
      scale: 1,
      boxShadow: 'none',
      borderRadius: theme.shape.innerBorderRadius,
    }));

    // when the the pop-out accessory is created or destroyed, show/hide the preview
    React.useEffect(() => {
      setRootStyles({
        display: hasShareAccessory ? 'none' : 'flex',
      });
      setVideoStyles({
        // reset scale
        scale: 1,
      });
    }, [hasShareAccessory, setRootStyles, setVideoStyles]);

    const bind = useGesture(
      {
        onDrag: (ev) => {
          ev.event?.stopPropagation();
          if (isLocal) {
            setRootStyles({
              x: ev.movement[0],
              y: ev.movement[1],
              cursor: 'grabbing',
            });
            setVideoStyles({
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
          ev.event?.stopPropagation();
          viewport.onObjectDragEnd();
          if (isLocal && ev.distance > TEAR_THRESHOLD) {
            addWidget({
              type: WidgetType.ScreenShare,
              initialData: {
                sharingUserId: localParticipant.sid,
              },
              publishImmediately: true,
              screenCoordinate: {
                x: ev.xy[0],
                y: ev.xy[1],
              },
            });
          } else {
            // if it was a tap, trigger fullscreen
            if (ev.tap) {
              setIsFullscreen(true);
            }
          }
          // return to neutral position either way
          setRootStyles({
            x: 0,
            y: 0,
          });
          setVideoStyles({
            scale: 1,
            boxShadow: 'none',
            borderRadius: theme.shape.innerBorderRadius,
          });
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
          <ScreenShare
            participantSid={participantSid}
            id={`${participantSid}-screenShare-preview`}
            isFullscreen={isFullscreen}
            onFullscreenExit={onFullscreenExit}
            className={classes.screenShare}
            placeholderClassName={classes.screenSharePlaceholder}
            onStreamEnd={handleStreamEnd}
          />
        </Box>
      </animated.div>
    );
  })
);
