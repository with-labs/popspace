import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookie from 'js-cookie';
import { CAMERA_DEVICE_COOKIE, MIC_DEVICE_COOKIE } from '../../constants/User';
import * as preferences from './preferencesSlice';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

/**
 * This component dispatches actions to update user preference settings
 * loaded from more persistent browser storage on mount and handles
 * updating media tracks when device preferences change. It doesn't
 * render anything.
 *
 * FIXME: this doesn't really need to be a component, but we need a way
 * to trigger side-effects off Redux store updates which can manipulate
 * the user media tracks. This isn't possible at the moment because the
 * Twilio starter app chose to store track data entirely in React state,
 * making it impossible for a Redux effect solution like redux-thunk
 * to change them.
 */
export const MediaDeviceSynchronizer = () => {
  const dispatch = useDispatch();

  // bootstrap initial preferences
  React.useEffect(() => {
    const cameraId = Cookie.get(CAMERA_DEVICE_COOKIE);
    const micId = Cookie.get(MIC_DEVICE_COOKIE);

    if (cameraId) {
      dispatch(preferences.actions.setActiveCamera({ deviceId: cameraId }));
    }
    if (micId) {
      dispatch(preferences.actions.setActiveMic({ deviceId: micId }));
    }
  }, [dispatch]);

  // getting the relevant media tracks
  const { localTracks } = useVideoContext();
  const micTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;
  const cameraTrack = localTracks.find((track) => track.name.includes('camera')) as LocalVideoTrack;

  // respond to changes in the active devices
  const activeCameraId = useSelector(preferences.selectors.selectActiveCameraId);
  const activeMicId = useSelector(preferences.selectors.selectActiveMicId);
  React.useEffect(() => {
    // TODO: is there ever a valid use case for selecting 'none'?
    if (!activeCameraId) return;

    cameraTrack?.restart({ deviceId: activeCameraId });
    Cookie.set(CAMERA_DEVICE_COOKIE, activeCameraId);
  }, [activeCameraId, cameraTrack]);
  React.useEffect(() => {
    // TODO: is there ever a valid use case for selecting 'none'?
    if (!activeMicId) return;

    micTrack?.restart({ deviceId: activeMicId });
    Cookie.set(MIC_DEVICE_COOKIE, activeMicId);
  }, [activeMicId, micTrack]);

  return null;
};
