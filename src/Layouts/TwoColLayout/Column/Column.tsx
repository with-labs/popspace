import React from 'react';
import clsx from 'clsx';
import styles from './Column.module.css';

interface IColumnProps {
  children: React.ReactNode;
  classNames?: string;
  useColMargin?: boolean;
}

export const Column: React.FC<IColumnProps> = (props) => {
  const { classNames, children, useColMargin = false } = props;

  return (
    <div
      className={clsx(
        styles.column,
        { [styles.colMargin]: useColMargin },
        'u-flex u-sm-flexJustifyStart u-sm-sizeFull u-md-size1of2 u-lg-size1of2',
        classNames
      )}
    >
      {children}
    </div>
  );
};
