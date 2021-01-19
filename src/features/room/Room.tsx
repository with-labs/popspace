import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { WidgetsFallback } from './WidgetsFallback';
import { RoomViewport } from './RoomViewport';
import { Person } from './people/Person';
import { Widget } from './widgets/Widget';
import { ViewportControls } from '../roomControls/viewport/ViewportControls';
import { RoomControls } from '../roomControls/RoomControls';
import { RoomSettingsModal } from '../roomControls/roomSettings/RoomSettingsModal';
import { UserSettingsModal } from '../roomControls/userSettings/UserSettingsModal';
import { ChangelogModal } from '../roomControls/ChangelogModal/ChangelogModal';
import { OnboardingModal } from '../roomControls/onboarding/OnboardingModal';
import { useRoomStore, RoomStateShape } from '../../roomState/useRoomStore';
import { EnterRoomModal } from '../roomControls/enterRoomModal/EnterRoomModal';
import { SpeakingStateObserver } from '../../components/SpeakingStateObserver/SpeakingStateObserver';
import { Hidden } from '@material-ui/core';
import { PageTitle } from '../../components/PageTitle/PageTitle';
import { useRoomName } from '../../hooks/useRoomName/useRoomName';
import shallow from 'zustand/shallow';
import { CursorLayer } from './cursors/CursorLayer';

interface IRoomProps {}

export const Room: React.FC<IRoomProps> = () => (
  <>
    <RoomViewportWrapper />
    <RoomSettingsModal />
    <SpeakingStateObserver />
    <UserSettingsModal />
    <EnterRoomModal />
    <ChangelogModal />
    <OnboardingModal />
  </>
);

const selectWidgetIds = (room: RoomStateShape) => Object.keys(room.widgets);
const selectPeopleIds = (room: RoomStateShape) => Object.keys(room.users);

const RoomViewportWrapper = React.memo<IRoomProps>(() => {
  // shallow comparator so component won't re-render if keys don't change
  const widgetIds = useRoomStore(selectWidgetIds, shallow);
  const peopleIds = useRoomStore(selectPeopleIds, shallow);

  const roomName = useRoomName();

  return (
    <RoomViewport
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
      {peopleIds.map((id) => (
        <Person key={id} personId={id} />
      ))}
      <CursorLayer />
    </RoomViewport>
  );
});
