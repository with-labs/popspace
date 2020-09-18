import React from 'react';
import clsx from 'clsx';
import { Button, ButtonTypes } from '../../../withComponents/Button/Button';
import styles from 'DashboardItem.module.css';

interface IDashboardProps {
  title: string;
  onClickHandler: () => {};
}

export const DashboardItem: React.FC<IDashboardProps> = (props) => {
  const { title } = props;
  const onButtonClickHandler = () => {};

  return (
    <div className={clsx(styles.dashboardItem)}>
      <div className={clsx(styles.title, 'u-fontH1')}>{title}</div>
      <Button
        buttonText="Join room"
        type={ButtonTypes.BUTTON}
        className={styles.joinRoomButton}
        onClickHandler={onButtonClickHandler}
      />
    </div>
  );
};
