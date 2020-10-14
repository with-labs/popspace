import React, { useState } from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';

import { Header } from '../../withComponents/Header/Header';
import { ConfirmationView } from './ConfirmationView';
import { isEmailValid } from '../../utils/CheckEmail';
import Api from '../../utils/api';

import styles from './Signin.module.css';
import signinImg from '../../images/SignIn.png';
import { Button, TextField } from '@material-ui/core';

import { useTranslation } from 'react-i18next';

interface ISigninProps {}

export const Signin: React.FC<ISigninProps> = (props) => {
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { t } = useTranslation();

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // clear any errors we have
    setEmailError('');

    const cleanEmail = email.trim();

    // check if the email is valid or not
    const isValid = isEmailValid(cleanEmail);

    if (isValid) {
      // TODO: fix typing
      const loginRequest: any = await Api.requestLoginOtp(cleanEmail);
      if (loginRequest.success) {
        // we have sent off the magic link to the user, so render success page
        setShowConfirmation(true);
      } else {
        // we have an error
        // TODO: update this once the error messaging from the backend is standarized
        setEmailError(loginRequest.message);
      }
    } else {
      setEmailError(t('error.messages.provideValidEmail'));
    }
  };

  return (
    <main className={clsx(styles.root, 'u-flex u-flexCol')}>
      <Header />
      {showConfirmation ? (
        <ConfirmationView email={email} />
      ) : (
        <TwoColLayout>
          <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter" useColMargin={true}>
            <div className={styles.container}>
              <div className={clsx(styles.title, 'u-fontH1')}>{t('pages.signin.title')}</div>
              <form onSubmit={onFormSubmit}>
                <TextField
                  id="SignIn-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('pages.signin.email.placeHolder')}
                  label={t('pages.signin.email.label')}
                  className={styles.emailInput}
                  error={!!emailError}
                  helperText={emailError}
                  margin="normal"
                />
                <Button type="submit" disabled={!email.length}>
                  {t('pages.signin.submitButtonText')}
                </Button>
              </form>
            </div>
          </Column>
          <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone">
            <div className={styles.imageContainer}>
              <img className={styles.image} src={signinImg} alt={t('pages.signin.imgAltText')} />
            </div>
          </Column>
        </TwoColLayout>
      )}
    </main>
  );
};
