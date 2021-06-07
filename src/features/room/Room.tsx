import React from 'react';
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary';
import { WidgetsFallback } from './WidgetsFallback';
import { RoomCanvasRenderer } from './canvas/RoomCanvasRenderer';
import { Person } from './people/Person';
import { Widget } from './widgets/Widget';
import { RoomControls } from '../roomControls/RoomControls';
import { RoomSettingsModal } from '../roomControls/roomSettings/RoomSettingsModal';
import { ChangelogModal } from '../roomControls/changelog/ChangelogModal';
import { useRoomStore, RoomStateShape } from '@roomState/useRoomStore';
import { SpeakingStateObserver } from '@components/SpeakingStateObserver/SpeakingStateObserver';
import { PageTitle } from '@components/PageTitle/PageTitle';
import shallow from 'zustand/shallow';
import { CursorLayer } from './cursors/CursorLayer';
import { PasteConfirmModal } from './pasting/PasteConfirmModal';
import { useBindPaste } from './pasting/useBindPaste';
import { RoomViewportProvider } from './RoomViewportProvider';
import { Box } from '@material-ui/core';
import { useExitToPreRoom } from '@hooks/useExitToPreRoom/useExitToPreRoom';
import { SignUpModal } from '../roomModals/SignUpModal';
import { ConfirmCodeModal } from '../roomModals/ConfirmCodeModal';
import { UnsavedModal } from '../roomModals/UnsavedModal';
import { UserEntryModal } from '../roomModals/UserEntryModal';
import { useRoomModalStore } from '../roomControls/useRoomModalStore';

interface IRoomProps {}

const selectWidgetIds = (room: RoomStateShape) => Object.keys(room.widgetPositions);
const selectPeopleIds = (room: RoomStateShape) => Object.keys(room.userPositions);

export const Room = React.memo<IRoomProps>(() => {
  // shallow comparator so component won't re-render if keys don't change
  const widgetIds = useRoomStore(selectWidgetIds, shallow);
  const peopleIds = useRoomStore(selectPeopleIds, shallow);
  const openModal = useRoomModalStore((store) => store.api.openModal);

  const roomName = useRoomStore((room: RoomStateShape) => room.state.displayName);
  useExitToPreRoom();
  useBindPaste();

  React.useEffect(() => {
    openModal('userEntry');
  }, [openModal]);

  return (
    <RoomViewportProvider>
      <Box display="flex" flexDirection="column" width="100%" height="100%" flex={1}>
        <RoomControls />
        <RoomCanvasRenderer data-test-room>
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
        </RoomCanvasRenderer>
      </Box>
      <RoomSettingsModal />
      <SpeakingStateObserver />
      <ChangelogModal />
      <UnsavedModal />
      <SignUpModal />
      <UserEntryModal />
      <ConfirmCodeModal email={'test@test.com'} />
    </RoomViewportProvider>
  );
});
