import client from '@api/client';
import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { KeyShortcut } from '@constants/keyShortcuts';
import { MobileBetaBanner } from '@features/roomControls/compatibility/MobileBetaBanner';
import { SafariBanner } from '@features/roomControls/compatibility/SafariBanner';
import { SupportedBrowsersModal } from '@features/roomModals/SupportedBrowsersModal';
import { useUserStats } from '@features/surveys/useUserStats';
import { Box } from '@material-ui/core';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
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

type UserStats = { count: number; lastRoom: string | null; date: string; completed: string[] };
export const Room = React.memo<IRoomProps>(() => {
  // shallow comparator so component won't re-render if keys don't change
  const widgetIds = useRoomStore(selectWidgetIds, shallow);
  const peopleIds = useRoomStore(selectPeopleIds, shallow);
  const roomName = useRoomStore((room: RoomStateShape) => room.displayName);
  const roomId = useRoomStore((room: RoomStateShape) => room.id);

  const [_, setSavedUserStats] = useUserStats();

  useBindPaste();

  // idk where else to put this right now?
  useHotkeys(KeyShortcut.Undo, () => {
    client.widgets.undoLastDelete();
  });

  React.useEffect(() => {
    setSavedUserStats((current) => {
      if (current) {
        const currentDate = new Date();
        if (current?.lastRoom !== roomId) {
          // if the user joins a new room, reset date and last room id, increment count
          return {
            ...current,
            date: currentDate.toDateString(),
            lastRoom: roomId,
            count: current.count + 1,
          };
        } else if (currentDate.toDateString() !== current?.date) {
          // user has joined the same room, but on a new day, so increment count
          return {
            ...current,
            date: currentDate.toDateString(),
            count: current.count + 1,
          };
        }
      }
      return current;
    });
  }, [roomId, setSavedUserStats]);

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
      <UnsavedModal />
      <SignUpModal />
      <UserEntryModal />
      <ReconnectingAlert />
      <SupportedBrowsersModal />
    </RoomViewportProvider>
  );
});
