import React, { RefObject, useCallback } from 'react';
import clsx from 'clsx';
import { ReactComponent as CloseBtn } from './images/Close.svg';
import { ReactComponent as AddBtn } from './images/Plus.svg';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';

import { DraggableEntity } from '../DraggableEntity/DraggableEntity';

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

export const Widget: React.FC<IWidgetProps> = (props) => {
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

  const addButton = onAddHandler ? (
    <div
      className={clsx(styles.addButton, 'u-cursorPointer u-flex u-flexAlignItemsCenter')}
      onClick={() => onAddHandler()}
    >
      <AddBtn />
    </div>
  ) : null;

  const onDragEnd = useCallback(
    (location: LocationTuple) => {
      updateWidgetLocation(id, location);
    },
    [updateWidgetLocation, id]
  );

  return (
    <DraggableEntity position={position} dragConstraints={dragConstraints} onDragEnd={onDragEnd} className={classNames}>
      <div className={clsx('u-flex u-flexCol', styles.widget, styles.grabbable, classNames)}>
        <div className={clsx('u-flex u-flexRow u-flexAlignItemsCenter', styles.title, titleClassNames)}>
          <div className={clsx('u-fontH2 u-flexGrow1', styles.titleText, styles.grabbable)}>{title}</div>
          {addButton}
          <div className="u-cursorPointer u-flex u-flexAlignItemsCenter" onClick={() => onCloseHandler()}>
            <CloseBtn />
          </div>
        </div>
        <div className={styles.widgetContent}>{children}</div>
      </div>
    </DraggableEntity>
  );
};
