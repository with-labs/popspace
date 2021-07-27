import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { SpeakingStateObserver } from '@components/SpeakingStateObserver/SpeakingStateObserver';
import { SafariBanner } from '@features/roomControls/compatibility/SafariBanner';
import { MobileBetaBanner } from '@features/roomControls/compatibility/MobileBetaBanner';

import { SupportedBrowsersModal } from '@features/roomModals/SupportedBrowsersModal';
import { Box } from '@material-ui/core';
import React from 'react';
import shallow from 'zustand/shallow';

import { RoomControls } from '../roomControls/RoomControls';
import { RoomSettingsModal } from '../roomControls/roomSettings/RoomSettingsModal';
import { SignUpModal } from '../roomModals/SignUpModal';
import { UnsavedModal } from '../roomModals/UnsavedModal';
import { UserEntryModal } from '../roomModals/UserEntryModal';
import { RoomCanvasRenderer } from './canvas/RoomCanvasRenderer';
import { CursorLayer } from './cursors/CursorLayer';
import { PasteConfirmModal } from './pasting/PasteConfirmModal';
import { useBindPaste } from './pasting/useBindPaste';
import { Person } from './people/Person';
import { ReconnectingAlert } from './ReconnectingAlert';
import { RoomViewportProvider } from './RoomViewportProvider';
import { Widget } from './widgets/Widget';
import { WidgetsFallback } from './WidgetsFallback';

interface IRoomProps {}

const selectWidgetIds = (room: RoomStateShape) => Object.keys(room.widgetPositions);
const selectPeopleIds = (room: RoomStateShape) =>
  Object.entries(room.users)
    .filter(([id, user]) => {
      return !user.isObserver && !!room.userPositions[id];
    })
    .map(([id]) => id);

export const Room = React.memo<IRoomProps>(() => {
  // shallow comparator so component won't re-render if keys don't change
  const widgetIds = useRoomStore(selectWidgetIds, shallow);
  const peopleIds = useRoomStore(selectPeopleIds, shallow);
  const roomName = useRoomStore((room: RoomStateShape) => room.displayName);

  useBindPaste();

  return (
    <RoomViewportProvider>
      <Box display="flex" flexDirection="column" width="100%" height="100%" flex={1}>
        <SafariBanner />
        <MobileBetaBanner />
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
      <UnsavedModal />
      <SignUpModal />
      <UserEntryModal />
      <ReconnectingAlert />
      <SupportedBrowsersModal />
    </RoomViewportProvider>
  );
});
