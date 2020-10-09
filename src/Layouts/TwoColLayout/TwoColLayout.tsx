import React from 'react';
import clsx from 'clsx';
import styles from './TwoColLayout.module.css';

interface ITwoColLayoutProps {
  children: React.ReactNode;
}

export const TwoColLayout: React.FC<ITwoColLayoutProps> = ({ children }) => {
  return (
    <div
      className={clsx(styles.twoColWrapper, 'u-flex u-sm-flexCol u-flexRow u-flexJustifyCenter u-flexAlignItemsCenter')}
    >
      {children}
    </div>
  );
};
