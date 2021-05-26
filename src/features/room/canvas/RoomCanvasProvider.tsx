import * as React from 'react';
import { Canvas } from '@providers/canvas/Canvas';
import { CanvasProvider } from '@providers/canvas/CanvasProvider';
import { useViewport } from '@providers/viewport/useViewport';

export interface IRoomCanvasProviderProps {
  children?: React.ReactNode;
  /** a pass-through handler for object gesture event lifecycles, to coordinate gesture state */
  onGestureStart?: () => void;
  /** a pass-through handler for object gesture event lifecycles, to coordinate gesture state */
  onGestureEnd?: () => void;
}

/**
 * RoomCanvasProvider houses the logic which translates movement gestures of objects
 * within the Room Canvas into actual changes in position. Objects report gestures
 * to this context and it updates their position and synchronizes changes to the backend,
 * then it pushes that new position back to the object via the observePosition callback
 * registration.
 */
export const RoomCanvasProvider: React.FC<IRoomCanvasProviderProps> = ({ children, onGestureStart, onGestureEnd }) => {
  const viewport = useViewport();

  const roomCanvas = React.useMemo(() => {
    return new Canvas(viewport);
  }, [viewport]);
  // unsubscribes and disposes when roomCanvas changes
  React.useEffect(() => () => roomCanvas.dispose(), [roomCanvas]);
  // connect gesture events
  React.useEffect(() => {
    if (onGestureStart) {
      roomCanvas.on('gestureStart', onGestureStart);
      return () => void roomCanvas.off('gestureStart', onGestureStart);
    }
  }, [roomCanvas, onGestureStart]);
  React.useEffect(() => {
    if (onGestureEnd) {
      roomCanvas.on('gestureEnd', onGestureEnd);
      return () => void roomCanvas.off('gestureEnd', onGestureEnd);
    }
  }, [onGestureEnd, roomCanvas]);

  return <CanvasProvider value={roomCanvas}>{children}</CanvasProvider>;
};
