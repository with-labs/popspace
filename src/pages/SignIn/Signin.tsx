import React, { useState } from 'react';
import { TextField } from '../../withComponents/TextField/TextField';
import { Button, ButtonTypes } from '../../withComponents/Button/Button';
import clsx from 'clsx';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Header } from '../../withComponents/Header/Header';
import { ConfirmationView } from './ConfirmationView';
import { isEmailValid } from '../../utils/CheckEmail';
import Api from '../../utils/api';

import styles from './Signin.module.css';
import signinImg from '../../images/SignIn.png';

interface ISigninProps {}

export const Signin: React.FC<ISigninProps> = (props) => {
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailError, setEmailError] = useState('');

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // clear any errors we have
    setEmailError('');

    // check if the email is valid or not
    const isValid = isEmailValid(email);

    if (isValid) {
      // TODO: fix typing
      const loginRequest: any = await Api.requestLoginOtp(email);
      if (loginRequest.success) {
        // we have sent off the magic link to the user, so render success page
        setShowConfirmation(true);
      } else {
        // we have an error
        // TODO: Do we want to change where this error shows up in the form or keep
        // it by the email?
        setEmailError(loginRequest.message);
      }
    } else {
      setEmailError('Please provide a valid email.');
    }
  };

  const signInForm = (
    <div className={styles.container}>
      <div className={clsx(styles.title, 'u-fontH1')}>Sign in</div>
      <form onSubmit={onFormSubmit}>
        <TextField
          id={`SignIn-email`}
          value={email}
          onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          placeholderText={'dorothy@emerald.so'}
          labelText="Email Address"
          className={styles.emailInput}
          hasError={emailError.length > 0}
          helperText={emailError}
        />
        <Button buttonText="Sign in" type={ButtonTypes.SUBMIT} isDisabled={email.length === 0} />
      </form>
    </div>
  );

  return (
    <main className="u-flex u-height100Percent u-flexCol">
      <Header />
      {showConfirmation ? (
        <ConfirmationView email={email} />
      ) : (
        <TwoColLayout
          left={signInForm}
          right={
            <div className={styles.imageContainer}>
              <img className={styles.image} src={signinImg} alt="sign in" />
            </div>
          }
          leftColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter"
          rightColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone"
        />
      )}
    </main>
  );
};
