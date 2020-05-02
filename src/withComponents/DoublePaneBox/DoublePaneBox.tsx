import React, { ReactNode } from 'react';
import clsx from 'clsx';

import styles from './DoublePaneBox.module.css';

interface IDoublePaneBoxProps {
  header?: ReactNode;
  leftPane: ReactNode;
  rightPane: ReactNode;
  footer?: ReactNode;
}

export const DoublePaneBox: React.FC<IDoublePaneBoxProps> = ({ header, leftPane, rightPane, footer }) => {
  return (
    <div className="DoublePaneBox">
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={clsx(styles.panes, 'u-flex u-flexJustifyBetween u-flexAlignCenter')}>
        <div className={clsx(styles.leftPane, 'u-flexGrow1')}>{leftPane}</div>
        <div className={clsx(styles.rightPane, 'u-flexGrow1')}>{rightPane}</div>
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
};
