import React, { RefObject, useRef } from 'react';
import { Widget } from '../Widget/Widget';
import { LocationTuple } from '../../types';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import styles from './whiteboard.module.css';

interface IWhiteboardData {
  whiteboardId: string;
}

type WhiteboardProps = {
  dragConstraints: RefObject<Element>;
  position?: LocationTuple;
  id: string;
  data: IWhiteboardData;
};

const Whiteboard = ({ id, dragConstraints, position, data }: WhiteboardProps) => {
  const { whiteboardId } = data;
  const iframeRef = useRef(null);
  const witeboardIdRef = useRef(whiteboardId);
  const { removeWidget } = useWidgetContext();

  const onCloseHandler = () => {
    removeWidget(id);
  };

  return (
    <Widget
      id={id}
      title="Whiteboard"
      position={position}
      onCloseHandler={onCloseHandler}
      dragConstraints={dragConstraints}
      classNames={styles.root}
      titleClassNames={styles.title}
    >
      <div className={styles.frame}>
        <div className={styles.matte}>
          <iframe
            title="whiteboard-widget"
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
