import React from 'react';
import clsx from 'clsx';
import { Button, ButtonTypes } from '../../../withComponents/Button/Button';
import { useHistory } from 'react-router-dom';

import styles from './DashboardItem.module.css';

interface IDashboardProps {
  roomName: string;
}

export const DashboardItem: React.FC<IDashboardProps> = (props) => {
  const { roomName } = props;
  const history = useHistory();

  const onButtonClickHandler = () => {
    history.push('/' + roomName);
  };

  return (
    <div className={clsx(styles.dashboardItem, 'u-flex u-flexCol u-sm-sizeFull u-size1of2')}>
      <div className={clsx(styles.title, 'u-fontH1 u-height100Percent')}>{roomName}</div>
      <Button
        buttonText="Join room"
        type={ButtonTypes.BUTTON}
        className={styles.joinRoomButton}
        onClickHandler={onButtonClickHandler}
      />
    </div>
  );
};
