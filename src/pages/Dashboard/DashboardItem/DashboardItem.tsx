import React from 'react';
import clsx from 'clsx';
import styles from './DashboardItem.module.css';

interface IDashboardProps {
  children?: React.ReactNode;
}

export const DashboardItem: React.FC<IDashboardProps> = (props) => {
  const { children } = props;

  return <div className={clsx(styles.dashboardItem, 'u-flex u-flexCol')}>{children}</div>;
};
