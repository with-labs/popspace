import React, { RefObject, useCallback } from 'react';
import clsx from 'clsx';
import { motion, PanInfo } from 'framer-motion';
import { ReactComponent as CloseBtn } from './images/Close.svg';
import { ReactComponent as AddBtn } from './images/Plus.svg';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';
import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';
import styles from './Widget.module.css';

interface IWidgetProps {
  id: string;
  position?: LocationTuple;
  title: string;
  titleClassNames?: string;
  classNames?: string;
  onCloseHandler: Function;
  onAddHandler?: Function;
  dragConstraints: RefObject<Element>;
}

export const Widget: React.FC<IWidgetProps> = props => {
  const {
    id,
    position,
    classNames,
    titleClassNames,
    onCloseHandler,
    onAddHandler,
    children,
    title,
    dragConstraints,
  } = props;
  const { updateWidgetLocation } = useWidgetContext();
  const [windowWidth, windowHeight] = useWindowSize();

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

  const addButton = onAddHandler ? (
    <div className="u-cursorPointer u-height100Percent" onClick={() => onAddHandler()}>
      <AddBtn />
    </div>
  ) : null;

  /*
   * @param event MouseEvent | TouchEvent | PointerEvent
   * @param info PanInfo
   */
  const onDragEndHandler = (event: any, info: PanInfo) => {
    // point: Relative to the device or page.
    const { x, y } = info.point;
    updateWidgetLocation(id, pxToLocation(x, y));
  };

  // if the widget has a position, get the
  // location for it and set x and y coords for
  // the motion.div animate prop
  let widgetAnimateLocation = {};
  if (position) {
    const pxLocation = locationToPx(position);
    widgetAnimateLocation = {
      x: pxLocation[0],
      y: pxLocation[1],
    };
  }

  return (
    <motion.div
      animate={widgetAnimateLocation}
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onDragEnd={onDragEndHandler}
      className={clsx('u-flex u-flexCol', styles.widget, classNames)}
    >
      <div className="u-flex u-flexRow">
        <div className={clsx('u-fontH2 u-cursorDefault u-flexGrow1', styles.title, titleClassNames)}>{title}</div>
        {addButton}
        <div className="u-cursorPointer u-height100Percent" onClick={() => onCloseHandler()}>
          <CloseBtn />
        </div>
      </div>
      <div className={styles.widgetContent}>{children}</div>
    </motion.div>
  );
};
