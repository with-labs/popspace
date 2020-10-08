import React from 'react';
import clsx from 'clsx';
import styles from './TwoColLayout.module.css';

interface ITwoColLayoutProps {
  children: React.ReactNode;
}

export const TwoColLayout: React.FC<ITwoColLayoutProps> = ({ children }) => {
  return (
    <div
      className={clsx(
        styles.contentPadding,
        'u-flex u-sm-flexCol u-flexRow u-flexJustifyCenter u-flexAlignItemsCenter u-flexAuto'
      )}
    >
      {children}
    </div>
  );
};
