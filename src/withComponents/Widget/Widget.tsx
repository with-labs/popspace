import React from 'react';
import clsx from 'clsx';
import { ReactComponent as CloseBtn } from './images/Close.svg';
import { ReactComponent as AddBtn } from './images/Plus.svg';
import styles from './Widget.module.css';

interface IWidgetProps {
  title: string;
  titleClassNames?: string;
  classNames?: string;
  onCloseHandler: Function;
  onAddHandler?: Function;
}

export const Widget: React.FC<IWidgetProps> = props => {
  const { classNames, titleClassNames, onCloseHandler, onAddHandler, children, title } = props;

  const addButton = onAddHandler ? (
    <div className="u-cursorPointer u-height100Percent" onClick={() => onAddHandler()}>
      <AddBtn />
    </div>
  ) : null;

  return (
    <div className={clsx('u-flex u-flexCol', styles.widget, classNames)}>
      <div className="u-flex u-flexRow">
        <div className={clsx('u-fontH2 u-cursorDefault u-flexGrow1', styles.title, titleClassNames)}>{title}</div>
        {addButton}
        <div className="u-cursorPointer u-height100Percent" onClick={() => onCloseHandler()}>
          <CloseBtn />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};
