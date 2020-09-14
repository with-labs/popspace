import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { LocationTuple } from '../../types';
import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';

import styles from './DraggableEntity.module.css';

interface IDraggableEntityProps {
  position?: LocationTuple;
  dragConstraints: RefObject<Element>;
  onDragEnd: (location: LocationTuple) => void;
  className?: string;
  disableDrag?: boolean;
}

export const DraggableEntity: React.FC<IDraggableEntityProps> = (props) => {
  const { position, children, dragConstraints, onDragEnd, className, disableDrag = false } = props;
  const [windowWidth, windowHeight] = useWindowSize();
  const entityRef = useRef<HTMLDivElement>(null!);
  const [isDragging, setIsDragging] = useState(false);

  // Callback to convert a location tuple to top/left values.
  const locationToPx = useCallback(
    ([x, y]: LocationTuple) => {
      return [windowWidth * x, windowHeight * y];
    },
    [windowWidth, windowHeight]
  );

  // Fn to convert top/left px coordintates to a LocationTuple.
  const pxToLocation = useCallback(
    (left: number, top: number) => {
      return [windowWidth && left / windowWidth, windowHeight && top / windowHeight] as LocationTuple;
    },
    [windowWidth, windowHeight]
  );

  // Calcuate the pixel positions of the widget from the position defined in the store.
  const [positionX, positionY] = position ? locationToPx(position) : [0, 0];
  const positionXPx = Math.round(positionX);
  const positionYPx = Math.round(positionY);

  // Motion values to track the position of the widget in the draggable area.
  const motionX = useMotionValue(positionXPx);
  const motionY = useMotionValue(positionYPx);
  // Get the pixel position as defined in the motion values for the widget.
  const motionXPx = Math.round(motionX.get());
  const motionYPx = Math.round(motionY.get());

  const onDragStartHandler = () => {
    setIsDragging(true);
  };
  /**
   * Handler to listen for the widget's drag end event and update the position in the store and motion values.
   *
   * @param event MouseEvent | TouchEvent | PointerEvent
   * @param info PanInfo
   */
  const onDragEndHandler = (event: any, info: PanInfo) => {
    // Get the x/y position of the widget that was dragged.
    let { x, y, height, width, right, bottom } = entityRef.current.getBoundingClientRect();

    // Do some sanitation to the x and y to make sure the widget doesn't go off-screen.
    x = x > 0 ? Math.min(x, right - width) : Math.max(x, 0);
    y = y > 0 ? Math.min(y, bottom - height) : Math.max(y, 0);

    // Set the new position into the motion values for x and y of the widget.
    motionX.set(Math.round(x));
    motionY.set(Math.round(y));

    // Update the widget location in the store.
    onDragEnd(pxToLocation(x, y));

    setIsDragging(false);
  };

  // If the "position" derived from the store differs from the position defined in the motion values, the widget
  // should animate to the new position.
  let widgetAnimateLocation = {};
  if (!isDragging && (positionXPx !== motionXPx || positionYPx !== motionYPx)) {
    widgetAnimateLocation = { x: positionXPx, y: positionYPx };
  }

  // Also update the motion values for x/y with the position from the store when the store x/y changes.
  useEffect(() => {
    motionX.set(positionXPx);
    motionY.set(positionYPx);
  }, [positionXPx, positionYPx, motionX, motionY]);

  return (
    <motion.div
      ref={entityRef}
      className={`${styles.DraggableEntity} ${className}`}
      animate={widgetAnimateLocation}
      initial={false}
      drag={!disableDrag}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onDragStart={onDragStartHandler}
      onDragEnd={onDragEndHandler}
      // Use the motion values for x and y
      style={{ x: motionX, y: motionY }}
    >
      {children}
    </motion.div>
  );
};
