import React, { useRef, MouseEvent } from 'react';

import clsx from 'clsx';

import styles from './whiteboard.module.css';

type WhiteboardProps = {
  onCloseHandler: (event: MouseEvent) => void;
  whiteboardId: string;
};

const Whiteboard = ({ whiteboardId, onCloseHandler }: WhiteboardProps) => {
  const iframeRef = useRef(null);
  const witeboardIdRef = useRef(whiteboardId);

  return (
    <div className={styles.root}>
      <div className={clsx('u-round u-layerSurfaceBeta', styles.close)} onClick={onCloseHandler}></div>
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
    </div>
  );
};

export default Whiteboard;
