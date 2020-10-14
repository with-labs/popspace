import React, { useState } from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import checkEmailImg from '../../images/CheckEmail.png';
import { useSnackbar } from 'notistack';
import styles from './Signin.module.css';

import Api from '../../utils/api';
import { isEmailValid } from '../../utils/CheckEmail';
import { useTranslation } from 'react-i18next';

interface IConfirmationViewProps {
  email: string;
}

export const ConfirmationView: React.FC<IConfirmationViewProps> = (props) => {
  const { email } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [error, setError] = useState('');

  // TODO: finialize how the error state looks on this page
  const handleResendLink = async () => {
    // check if the email is valid or not
    const isValid = isEmailValid(email);

    if (isValid) {
      // TODO: fix typing
      const loginRequest: any = await Api.requestLoginOtp(email);
      if (loginRequest.success) {
        // we have sent off the magic link to the user,
        // clear any error
        setError('');
        enqueueSnackbar(t('pages.confirmationView.snackSuccessMsg'), { variant: 'success' });
      } else {
        // we have an error
        // TODO: update this once the error messaging from the backend is standarized
        setError(loginRequest.message);
      }
    } else {
      enqueueSnackbar(t('pages.confirmationView.snackFailMsg'), { variant: 'error' });
      setError('Invalid email');
    }
  };

  return (
    <TwoColLayout>
      <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter" useColMargin={true}>
        <div className={styles.container}>
          <div className={clsx(styles.title, 'u-fontH1')}>{t('pages.confirmationView.title')}</div>
          <div className="u-fontP1">
            We sent a magic link to {email}
            <br />
            <br />
            Click on the link in the email and you will be automatically logged in.
            <br />
            <br />
            If you didn’t receive the email, you can{' '}
            <button className={clsx(styles.buttonLink, 'u-fontP1 u-fontBold')} onClick={handleResendLink}>
              request a new link
            </button>
            . Don't forget to check your spam folder!
          </div>
          <div className={styles.error}>{error}</div>
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
