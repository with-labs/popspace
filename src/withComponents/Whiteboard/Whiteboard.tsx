import React, { RefObject, useRef, MouseEvent } from 'react';
import { Widget } from '../Widget/Widget';
import { LocationTuple } from '../../types';
import clsx from 'clsx';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';

import styles from './whiteboard.module.css';

type WhiteboardProps = {
  onCloseHandler: (event: MouseEvent) => void;
  whiteboardId: string;
  dragConstraints: RefObject<Element>;
  position?: LocationTuple;
  widgetId: string;
  initialOffset?: number;
};

const Whiteboard = ({
  widgetId,
  whiteboardId,
  onCloseHandler,
  dragConstraints,
  position,
  initialOffset = 0,
}: WhiteboardProps) => {
  const iframeRef = useRef(null);
  const witeboardIdRef = useRef(whiteboardId);

  return (
    <Widget
      id={widgetId}
      title="Whiteboard"
      position={position}
      onCloseHandler={onCloseHandler}
      dragConstraints={dragConstraints}
      classNames={styles.root}
      initialOffset={initialOffset}
      type={WidgetTypes.Whiteboard}
    >
      <div className={styles.frame}>
        <div className={styles.matte}>
          <iframe
            ref={iframeRef}
            className={styles.frame}
            src={`${window.location.protocol}//witeboard.com/${witeboardIdRef.current}`}
            scrolling="no"
            width="100%"
            height="100%"
          ></iframe>
        </div>
      </div>
    </Widget>
  );
};

export default Whiteboard;
