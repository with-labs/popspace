import client from '@api/client';
import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { SpeakingStateObserver } from '@components/SpeakingStateObserver/SpeakingStateObserver';
import { KeyShortcut } from '@constants/keyShortcuts';
import { MobileBetaBanner } from '@features/roomControls/compatibility/MobileBetaBanner';
import { SafariBanner } from '@features/roomControls/compatibility/SafariBanner';
import { SupportedBrowsersModal } from '@features/roomModals/SupportedBrowsersModal';
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
import { useLocalStorage } from '@hooks/useLocalStorage/useLocalStorage';

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
  const roomId = useRoomStore((room: RoomStateShape) => room.id);

  const [savedUserStats, setSavedUserStats] = useLocalStorage('tilde_user_stats', {
    count: 1,
    lastRoom: roomId,
    date: '',
    completed: [] as string[],
  });

  useBindPaste();

  // idk where else to put this right now?
  useHotkeys(KeyShortcut.Undo, () => {
    client.widgets.undoLastDelete();
  });

  React.useEffect(() => {
    const currentDate = new Date();
    if (savedUserStats.lastRoom !== roomId) {
      // if the user joins a new room, reset date and last room id, increment count
      setSavedUserStats({
        ...savedUserStats,
        date: currentDate.toDateString(),
        lastRoom: roomId,
        count: savedUserStats.count++,
      });
    } else if (currentDate.toDateString() !== savedUserStats.date) {
      // user has joined the same room, but on a new day, so increment count
      setSavedUserStats({
        ...savedUserStats,
        date: currentDate.toDateString(),
        count: savedUserStats.count++,
      });
    }
  });

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
