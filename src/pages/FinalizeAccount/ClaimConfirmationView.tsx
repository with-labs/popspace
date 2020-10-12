import React from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import checkEmailImg from '../../images/CheckEmail.png';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import styles from './FinalizeAccount.module.css';

import { isMobileOnly } from 'react-device-detect';

interface IClaimConfirmationViewProps {
  roomName: string;
  email: string;
}

export const ClaimConfirmationView: React.FC<IClaimConfirmationViewProps> = (props) => {
  const { email, roomName } = props;
  const history = useHistory();

  const onGotoRoomClick = () => {
    history.push(`/${roomName}`);
  };

  return (
    <TwoColLayout>
      <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter" useColMargin={true}>
        <div className={styles.container}>
          <div className={clsx(styles.title, 'u-fontH1')}>Your room has been claimed</div>
          <div className="u-fontP1">
            Your room {roomName} is now associated to your account {email}.
            <br />
            <br />
            We are hard at work to allow you to invite other people to your room. For now, your guests can still access
            your room with the same room password as before.
            {isMobileOnly && (
              <>
                <br />
                <br />
                With is currently not optimized for mobile. We rather polish the experience before you can use it. Sorry
                for the inconvenience.
              </>
            )}
          </div>
          {!isMobileOnly && (
            <Button className={styles.button} onClick={onGotoRoomClick}>
              Go to my room
            </Button>
          )}
        </div>
      </Column>
      <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone">
        <div className={styles.imageContainer}>
          <img className={styles.image} src={checkEmailImg} alt="Check email" />
        </div>
      </Column>
    </TwoColLayout>
  );
};
