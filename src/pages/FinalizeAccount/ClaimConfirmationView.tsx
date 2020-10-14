import React from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import signinImg from '../../images/SignIn.png';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { isMobileOnly } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

import styles from './FinalizeAccount.module.css';

interface IClaimConfirmationViewProps {
  roomName: string;
  email: string;
}

export const ClaimConfirmationView: React.FC<IClaimConfirmationViewProps> = (props) => {
  const { email, roomName } = props;
  const history = useHistory();
  const { t } = useTranslation();

  const onGotoRoomClick = () => {
    history.push(`/${roomName}`);
  };

  return (
    <TwoColLayout>
      <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter" useColMargin={true}>
        <div className={styles.container}>
          <div className={clsx(styles.title, 'u-fontH1')}>{t('pages.claimConfirmationView.title')}</div>
          <div className="u-fontP1">
            {t('pages.claimConfirmationView.associationText', { roomName, email })}
            <br />
            <br />
            {t('pages.claimConfirmationView.confirmationBody')}
            {isMobileOnly && (
              <>
                <br />
                <br />
                {t('pages.claimConfirmationView.mobileOptimizationNotice')}
              </>
            )}
          </div>
          {!isMobileOnly && (
            <Button className={styles.button} onClick={onGotoRoomClick}>
              {t('pages.claimConfirmationView.gotoRoomBtn')}
            </Button>
          )}
        </div>
      </Column>
      <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone">
        <div className={styles.imageContainer}>
          <img className={styles.image} src={signinImg} alt={t('pages.claimConfirmationView.imgAltText')} />
        </div>
      </Column>
    </TwoColLayout>
  );
};
