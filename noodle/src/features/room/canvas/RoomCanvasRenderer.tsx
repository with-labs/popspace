import { useRoomStore } from '@api/useRoomStore';
import { useLocalStorage } from '@hooks/useLocalStorage/useLocalStorage';
import { makeStyles, Theme } from '@material-ui/core';
import { CanvasRenderer } from '@providers/canvas/CanvasRenderer';
import { CanvasWallpaper } from '@providers/canvas/CanvasWallpaper';
import { useViewport } from '@providers/viewport/useViewport';
import { useViewportGestureControls } from '@providers/viewport/useViewportGestureControls';
import useMergedRefs from '@react-hook/merged-ref';
import { animated } from '@react-spring/web';
import * as React from 'react';
import shallow from 'zustand/shallow';

import { mandarin as theme } from '../../../theme/theme';
import { useKeyboardControls } from '../../roomControls/viewport/useKeyboardControls';
import { FileDropLayer } from '../files/FileDropLayer';
import { RoomCanvasProvider } from './RoomCanvasProvider';

export interface IRoomCanvasRendererProps {
  children: React.ReactNode;
}

const DESKTOP_INITIAL_ZOOM = 1.25;
const MOBILE_INITIAL_ZOOM = 1;
const isMobile = typeof window !== 'undefined' && window.matchMedia(theme.breakpoints.down('sm'));
const INITIAL_ZOOM = isMobile ? MOBILE_INITIAL_ZOOM : DESKTOP_INITIAL_ZOOM;

const DEBUG_RENDER_CENTER_RETICLE = localStorage.getItem('DEBUG') === 'true';

const useStyles = makeStyles<Theme, IRoomCanvasRendererProps>((theme) => ({
  fileDropLayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  viewport: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'move',
    position: 'relative',
    touchAction: 'none',
    contain: 'strict',
    '&:focus': {
      outline: 'none',
    },
  },
  canvas: {
    position: 'absolute',
    transformOrigin: 'center center',
  },
  background: {
    position: 'absolute',
    borderRadius: theme.shape.borderRadius,
    backgroundRepeat: 'repeat',
    backgroundSize: '2400px 2400px',
    zIndex: 0,
  },
}));

export const RoomCanvasRenderer: React.FC<IRoomCanvasRendererProps> = (props) => {
  const styles = useStyles(props);

  const { children, ...rest } = props;

  const [savedZoom, setSavedZoom] = useLocalStorage('with_savedZoom', INITIAL_ZOOM);

  const [wallpaperUrl, accentColor, wallpaperFallbackUrl, fallbackColor, wallpaperRepeats] = useRoomStore(
    (room) => [
      room.wallpaper?.url,
      room.wallpaper?.dominantColor,
      room.state.wallpaperUrl,
      room.state.backgroundColor,
      room.state.wallpaperRepeats,
    ],
    shallow
  );

  const viewportElementRef = React.useRef<HTMLDivElement>(null);

  const viewport = useViewport();

  const currentUser = useRoomStore((room) => room.cacheApi.getCurrentUser());
  const isReady = currentUser && !currentUser.isObserver;

  // these need to be cached in refs so they don't invalidate the effect
  // below when the window size changes.
  const savedZoomRef = React.useRef(savedZoom);
  // on first mount, the view is zoomed out at the center of the room
  // wait a moment, then zoom in to the user's avatar
  React.useEffect(() => {
    if (!isReady) return;

    const timeout = setTimeout(async () => {
      // find user's position
      const room = useRoomStore.getState();
      const userId = room.sessionId && room.sessionLookup[room.sessionId];
      if (!userId) return;

      const userPosition = room.userPositions[userId];
      const point = userPosition.position;

      viewport.doMove(point, savedZoomRef.current, { origin: 'animation' });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isReady, viewport]);

  const viewportProps = useViewportGestureControls(viewport, viewportElementRef, { initialZoom: INITIAL_ZOOM });

  const onObjectDragStart = React.useCallback(() => {
    if (!viewportElementRef.current) return;
    viewportElementRef.current.style.cursor = 'grabbing';
  }, []);

  const onObjectDragEnd = React.useCallback(() => {
    if (!viewportElementRef.current) return;
    viewportElementRef.current.style.cursor = 'move';
  }, []);

  const { props: keyControlProps } = useKeyboardControls(viewport);

  const viewportRef = useMergedRefs(keyControlProps.ref, viewportElementRef, viewport.bindElement);

  return (
    <RoomCanvasProvider onGestureStart={onObjectDragStart} onGestureEnd={onObjectDragEnd}>
      <animated.div className={styles.viewport} {...keyControlProps} ref={viewportRef} {...viewportProps} {...rest}>
        <FileDropLayer className={styles.fileDropLayer}>
          <CanvasRenderer onZoomChange={setSavedZoom}>
            <CanvasWallpaper
              imageUrl={wallpaperUrl || wallpaperFallbackUrl}
              color={accentColor || fallbackColor}
              wallpaperRepeats={wallpaperRepeats}
            />
            {children}
          </CanvasRenderer>
        </FileDropLayer>
        {DEBUG_RENDER_CENTER_RETICLE && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1,
              height: 1,
              backgroundColor: 'red',
              zIndex: 10000,
            }}
          />
        )}
      </animated.div>
    </RoomCanvasProvider>
  );
};
