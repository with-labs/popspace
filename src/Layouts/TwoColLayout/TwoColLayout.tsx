import React from 'react';
import clsx from 'clsx';
import styles from './TwoColLayout.module.css';

interface ITwoColLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftColClassNames?: string;
  rightColClassNames?: string;
}

export const TwoColLayout: React.FC<ITwoColLayoutProps> = (props) => {
  const { left, right, leftColClassNames, rightColClassNames } = props;

  return (
    <div
      className={clsx(
        styles.contentPadding,
        'u-flex u-sm-flexCol u-flexRow u-flexJustifyCenter u-flexAlignItemsCenter u-flexAuto'
      )}
    >
      <div
        className={clsx(
          styles.colMargin,
          styles.column,
          'u-flex u-sm-flexJustifyStart u-sm-sizeFull u-md-size1of2 u-lg-size1of2',
          leftColClassNames
        )}
      >
        {left}
      </div>
      <div className={clsx(styles.column, 'u-flex u-sm-sizeFull u-md-size1of2 u-lg-size1of2', rightColClassNames)}>
        {right}
      </div>
    </div>
  );
};
