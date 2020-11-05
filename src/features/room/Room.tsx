import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { WidgetsFallback } from './WidgetsFallback';
import { RoomViewport } from './RoomViewport';
import { Person } from './people/Person';
import { useSelector } from 'react-redux';
import { selectors } from './roomSlice';
import { Widget } from './widgets/Widget';
import { ViewportControls } from '../roomControls/viewport/ViewportControls';
import { useRoomPresence } from './useRoomPresence';
import { useLocalVolumeDetection } from './useLocalVolumeDetection';
import { RoomControls } from '../roomControls/RoomControls';
import { WallpaperModal } from '../roomControls/wallpaper/WallpaperModal';
import { MembershipManagementModal } from '../roomControls/membership/MembershipManagementModal';
import { UserSettingsModal } from '../roomControls/userSettings/UserSettingsModal';
import { ChangelogModal } from '../roomControls/ChangelogModal/ChangelogModal';

interface IRoomProps {}

// creating a separate component for these so that they won't trigger
// re-renders of the entire Room
// TODO: improve re-render triggering on these hooks.
const LocalVolumeDetector = () => {
  useLocalVolumeDetection();
  return null;
};

const RoomPresenceDetector = () => {
  useRoomPresence();
  return null;
};

export const Room: React.FC<IRoomProps> = () => (
  <>
    <RoomViewportWrapper />
    <WallpaperModal />
    <LocalVolumeDetector />
    <RoomPresenceDetector />
    <MembershipManagementModal />
    <UserSettingsModal />
    <ChangelogModal />
  </>
);

const RoomViewportWrapper = React.memo<IRoomProps>(() => {
  const bounds = useSelector(selectors.selectRoomBounds);
  const widgetIds = useSelector(selectors.selectWidgetIds);
  const participantIds = useSelector(selectors.selectPeopleIds);
  const backgroundUrl = useSelector(selectors.selectWallpaperUrl);

  return (
    <RoomViewport
      bounds={bounds}
      backgroundUrl={backgroundUrl}
      uiControls={
        <>
          <RoomControls />
          <ViewportControls />
        </>
      }
      data-test-room
    >
      <ErrorBoundary fallback={() => <WidgetsFallback />}>
        {widgetIds.map((id) => (
          <Widget id={id} key={id} />
        ))}
      </ErrorBoundary>
      {participantIds.map((id) => (
        <Person id={id} key={id} />
      ))}
    </RoomViewport>
  );
});
