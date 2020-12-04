import React, { useMemo, useEffect } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { WidgetsFallback } from './WidgetsFallback';
import { RoomViewport } from './RoomViewport';
import { Person } from './people/Person';
import { useSelector } from 'react-redux';
import { selectors } from './roomSlice';
import { Widget } from './widgets/Widget';
import { ViewportControls } from '../roomControls/viewport/ViewportControls';
import { useLocalVolumeDetection } from './useLocalVolumeDetection';
import { RoomControls } from '../roomControls/RoomControls';
import { RoomSettingsModal } from '../roomControls/roomSettings/RoomSettingsModal';
import { UserSettingsModal } from '../roomControls/userSettings/UserSettingsModal';
import { ChangelogModal } from '../roomControls/ChangelogModal/ChangelogModal';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useCleanupDisconnectedPeople } from './useCleanupDisconnectedPeople';
import { OnboardingModal } from '../roomControls/onboarding/OnboardingModal';
import { ParticipantState } from '../../constants/twilio';
import { Hidden } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { actions } from './roomSlice';
import { useRoomName } from '../../hooks/useRoomName/useRoomName';
import { PageTitle } from '../../components/PageTitle/PageTitle';
import { EnterRoomModal } from '../roomControls/enterRoomModal/EnterRoomModal';

interface IRoomProps {}

// creating a separate component for these so that they won't trigger
// re-renders of the entire Room
// TODO: improve re-render triggering on these hooks.
const LocalVolumeDetector = () => {
  useLocalVolumeDetection();
  return null;
};

const CleanupDisconnectedPeople = React.memo(() => {
  useCleanupDisconnectedPeople();
  return null;
});

export const Room: React.FC<IRoomProps> = () => (
  <>
    <RoomViewportWrapper />
    <RoomSettingsModal />
    <LocalVolumeDetector />
    <CleanupDisconnectedPeople />
    <UserSettingsModal />
    <EnterRoomModal />
    <ChangelogModal />
    <OnboardingModal />
  </>
);

const RoomViewportWrapper = React.memo<IRoomProps>(() => {
  const bounds = useSelector(selectors.selectRoomBounds);
  const widgetIds = useSelector(selectors.selectWidgetIds);
  const backgroundUrl = useSelector(selectors.selectWallpaperUrl);
  const dispatch = useDispatch();
  const roomName = useRoomName();

  const { allParticipants, room } = useVideoContext();
  // only show participants who are actually connected
  const connectedParticipants = useMemo(() => allParticipants.filter((p) => p.state === ParticipantState.Connected), [
    allParticipants,
  ]);

  useEffect(() => {
    return () => {
      // When the room unmounts we should disconnect the user
      // the main case for this is if a user hits the back button
      // disconnecting from the room will prevent a user from doubling up
      // if they rejoin the room after hitting back
      room?.disconnect();
      dispatch(actions.leave());
    };
  }, [room, dispatch]);

  return (
    <RoomViewport
      bounds={bounds}
      backgroundUrl={backgroundUrl}
      uiControls={
        <>
          <RoomControls />
          <Hidden smDown>
            <ViewportControls />
          </Hidden>
        </>
      }
      data-test-room
    >
      <PageTitle title={roomName} />
      <ErrorBoundary fallback={() => <WidgetsFallback />}>
        {widgetIds.map((id) => (
          <Widget id={id} key={id} />
        ))}
      </ErrorBoundary>
      {connectedParticipants.map((participant) => (
        <Person participant={participant} key={participant.sid} />
      ))}
    </RoomViewport>
  );
});
