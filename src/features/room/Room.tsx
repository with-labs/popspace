import React from 'react';
import { SharedScreenViewer } from '../../withComponents/SharedScreenViewer/SharedScreenViewer';
import { useLocalVolumeDetection } from '../../withHooks/useLocalVolumeDetection/useLocalVolumeDetection';
import { ErrorBoundary } from '../../withComponents/ErrorBoundary/ErrorBoundary';
import { WidgetsFallback } from './WidgetsFallback';
import { RoomViewport } from './RoomViewport';
import { Person } from './people/Person';
import { useSelector } from 'react-redux';
import { selectors } from './roomSlice';
import { Widget } from './widgets/Widget';
import { useBackgroundUrl } from '../../withHooks/useBackgroundUrl/useBackgroundUrl';
import { AccessoriesDock } from '../../withComponents/AccessoriesDock/AccessoriesDock';
import { ViewportControls } from './controls/viewport/ViewportControls';

interface IRoomProps {}

export const Room: React.FC<IRoomProps> = () => {
  const bounds = useSelector(selectors.selectRoomBounds);
  const widgetIds = useSelector(selectors.selectWidgetIds);
  const participantIds = useSelector(selectors.selectPeopleIds);

  const backgroundUrl = useBackgroundUrl();

  useLocalVolumeDetection();

  return (
    <>
      <RoomViewport
        bounds={bounds}
        backgroundUrl={backgroundUrl}
        uiContent={
          <>
            <AccessoriesDock />
            <ViewportControls />
          </>
        }
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
      <SharedScreenViewer />
    </>
  );
};
