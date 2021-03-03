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
import { useRoomStore, RoomStateShape } from '../../roomState/useRoomStore';
import { SpeakingStateObserver } from '../../components/SpeakingStateObserver/SpeakingStateObserver';
import { Hidden } from '@material-ui/core';
import { PageTitle } from '../../components/PageTitle/PageTitle';
import shallow from 'zustand/shallow';
import { CursorLayer } from './cursors/CursorLayer';
import { MembershipManagementModal } from '../roomControls/membership/MemberMangementModal';
import { PasteConfirmModal } from './pasting/PasteConfirmModal';
import { useBindPaste } from './pasting/useBindPaste';
import { EntryOverlay } from '../roomControls/entryOverlay/EntryOverlay';

interface IRoomProps {}

export const Room: React.FC<IRoomProps> = () => (
  <>
    <RoomViewportWrapper />
    <RoomSettingsModal />
    <SpeakingStateObserver />
    <UserSettingsModal />
    <ChangelogModal />
    <EntryOverlay />
    <MembershipManagementModal />
  </>
);

const selectWidgetIds = (room: RoomStateShape) => Object.keys(room.widgets);
const selectPeopleIds = (room: RoomStateShape) => Object.keys(room.users);

const RoomViewportWrapper = React.memo<IRoomProps>(() => {
  // shallow comparator so component won't re-render if keys don't change
  const widgetIds = useRoomStore(selectWidgetIds, shallow);
  const peopleIds = useRoomStore(selectPeopleIds, shallow);

  const roomName = useRoomStore((room: RoomStateShape) => room.state.displayName);

  useBindPaste();

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
      <PasteConfirmModal />
    </RoomViewport>
  );
});
