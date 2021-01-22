import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  Button,
  DialogActions,
  Box,
  Typography,
  makeStyles,
  CircularProgress,
} from '@material-ui/core';
import { LocalVideoTrack } from 'twilio-video';
import { MediaReadinessContext } from '../../../components/MediaReadinessProvider/MediaReadinessProvider';
import { CameraToggle } from '../media/CameraToggle';
import { MicToggle } from '../media/MicToggle';
import { useLocalTracks } from '../../../components/LocalTracksProvider/useLocalTracks';
import ErrorDialog from '../../../components/ErrorDialog/ErrorDialog';
import VideoTrack from '../../../components/VideoTrack/VideoTrack';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { PseudoUserBubble } from '../../room/people/PseudoUserBubble';
import { logger } from '../../../utils/logger';

import bg from './images/permission_bg.png';
import permissionVideo from './media/Permission Setting_final_fixed.mp4';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 360,
  },
  contentWrapper: {
    marginTop: theme.spacing(3),
  },
  actionsWrapper: {
    width: '100%',
  },
  controls: {
    marginBottom: theme.spacing(3),
  },
  videoContainer: {
    minHeight: 280,
    position: 'relative',
  },
  bgImg: {
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
  bubble: {
    margin: '20px',
  },
  loadingRoot: {
    height: 535,
  },
  loadingText: {
    marginTop: theme.spacing(4),
  },
  cameraDenied: {
    backgroundColor: theme.palette.brandColors.slate.light,
    height: '100%',
  },
  permissionVideo: {
    height: 310,
  },
}));

type RequestPermissionsState = {
  status: 'requested' | 'granted' | 'denied' | 'inital';
  error: Error | null;
};

type RequestPermissionsAction = {
  type: string;
  payload: any;
};

enum ACTIONS {
  UPDATE_STATUS = 'UPDATE_STATUS',
  SET_ERROR = 'SET_ERROR',
}

enum STATUS {
  REQUESTED = 'requested',
  GRANTED = 'granted',
  DENIED = 'denied',
  INITAL = 'inital',
}

function RequestDevicePermissionsReducer(state: RequestPermissionsState, action: RequestPermissionsAction) {
  switch (action.type) {
    case ACTIONS.UPDATE_STATUS: {
      return {
        ...state,
        status: action.payload,
      };
    }
    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const RequestPermissionModal: React.FC = () => {
  const classes = useStyles();
  const { isReady, onReady } = React.useContext(MediaReadinessContext);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [state, dispatch] = React.useReducer(RequestDevicePermissionsReducer, {
    status: 'inital',
    error: null,
  });

  const { user } = useCurrentUserProfile();
  const userId = user?.id;
  const person = useRoomStore((room) => room.users[userId ?? '']);
  const { avatarName } = person?.participantState;
  const displayIdentity = person?.participantState.displayName;

  // these are twillio tracks
  const { videoTrack } = useLocalTracks();

  useEffect(() => {
    if (!isReady) {
      // on mount query for the media devices of the browser
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          // get the list of devices that have been given permission,
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
          // docs state that a device that is active or has permissions will have a label set,
          // so we are going off of that assumption
          const hasActieDevices = devices.some(
            (val) =>
              val.deviceId !== 'default' &&
              ((val.kind === 'audioinput' && val.label !== '') || (val.kind === 'videoinput' && val.label !== ''))
          );

          if (!hasActieDevices) {
            setIsOpen(true);
          } else if (!isReady) {
            // isReady here maybe
            // we already have devicess that we have persmission on, so pop the pre-room
            dispatch({ type: ACTIONS.UPDATE_STATUS, payload: STATUS.GRANTED });
            setIsOpen(true);
          }
        })
        .catch(function (err) {
          if (err.message === 'Permission denied') {
            // user denied our request
            dispatch({ type: ACTIONS.UPDATE_STATUS, payload: STATUS.DENIED });
          } else {
            /* handle the error */
            dispatch({ type: ACTIONS.SET_ERROR, payload: err });
            logger.error(`Error enumerating user devices for ${userId}`);
          }
        });
    }
  }, [setIsOpen, isReady, userId, dispatch]);

  const onRequestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      dispatch({ type: ACTIONS.UPDATE_STATUS, payload: STATUS.REQUESTED });

      // setIsLoading(true);
      stream.getTracks().forEach(function (track) {
        if (track.readyState === 'live') {
          track.stop();
        }
      });

      // forwhat ever reason, when we are calling stop the track isnt throwing the
      // appropriate events, so we are just going to call a timer to pop a loading screen
      // until we re-work our track to accept mediastream tracks as an inital stream
      setTimeout(() => {
        dispatch({ type: ACTIONS.UPDATE_STATUS, payload: STATUS.GRANTED });
      }, 4000);
    } catch (err) {
      if (err.message === 'Permission denied') {
        // user denied our request
        dispatch({ type: ACTIONS.UPDATE_STATUS, payload: STATUS.DENIED });
      } else {
        /* handle the error */
        dispatch({ type: ACTIONS.SET_ERROR, payload: err });
        logger.error(`Error getting user media for ${userId}`);
      }
    }
  };

  const onJoinRoom = () => {
    setIsOpen(false);
    // join the room with the audio/video on/off
    onReady();
  };

  return (
    <Dialog open={isOpen} disableBackdropClick>
      <Box className={classes.root}>
        {state.status === STATUS.INITAL && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <video className={classes.permissionVideo} autoPlay loop muted>
              <source src={permissionVideo} type="video/mp4" />
            </video>
            <DialogContent>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                className={classes.contentWrapper}
              >
                <div>
                  <Trans>
                    <Typography variant="body1">
                      {t('modals.devicePermissionsModal.permissionExplainationText')}
                    </Typography>
                  </Trans>
                </div>
              </Box>
            </DialogContent>
            <DialogActions className={classes.actionsWrapper}>
              <Button onClick={onRequestPermissions} fullWidth>
                {t('modals.devicePermissionsModal.requestPermissonsButton')}
              </Button>
            </DialogActions>
          </Box>
        )}
        {state.status === STATUS.REQUESTED && (
          <DialogContent className={classes.loadingRoot}>
            <Box height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <CircularProgress />
              <Typography variant="body1" className={classes.loadingText}>
                {t('modals.devicePermissionsModal.loadingMessage')}
              </Typography>
            </Box>
          </DialogContent>
        )}
        {(state.status === STATUS.GRANTED || state.status === STATUS.DENIED) && (
          <Box>
            <Box
              className={classes.videoContainer}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <img src={bg} className={classes.bgImg} alt="background-img" />
              <PseudoUserBubble
                avatarName={avatarName}
                displayIdentity={displayIdentity}
                isVideoOn={!!videoTrack}
                className={classes.bubble}
              >
                {videoTrack && <VideoTrack classNames={classes.video} track={videoTrack as LocalVideoTrack} />}
              </PseudoUserBubble>
            </Box>
            <DialogContent>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Box
                  className={classes.controls}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <CameraToggle isLocal={true} />
                  <MicToggle isLocal={true} />
                </Box>
                <Typography variant="body1">{t('modals.devicePermissionsModal.setupExplaination')}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onJoinRoom}>{t('modals.devicePermissionsModal.enterRoomButton')}</Button>
            </DialogActions>
          </Box>
        )}
      </Box>
      <ErrorDialog error={state.error} dismissError={() => dispatch({ type: ACTIONS.SET_ERROR, payload: null })} />
    </Dialog>
  );
};
