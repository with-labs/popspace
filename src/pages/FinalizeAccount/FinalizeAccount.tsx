import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './FinalizeAccount.module.css';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { TextField } from '../../withComponents/TextField/TextField';
import { CheckBox } from '../../withComponents/CheckBox/CheckBox';
import { Button, ButtonTypes } from '../../withComponents/Button/Button';

import { Header } from '../../withComponents/Header/Header';
import signinImg from '../../images/SignIn.png';

interface IFinalizeAccountProps {
  email: string;
}

export const FinalizeAccount: React.FC<IFinalizeAccountProps> = (props) => {
  const { email } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [sendEmails, setSendEmails] = useState(false);

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const rightCol = (
    <div className={clsx(styles.container, 'u-flex u-flexCol')}>
      <div className={clsx(styles.title, 'u-fontH1')}>Finalize your account</div>
      <div className={clsx(styles.text, 'u-fontP1')}>
        As an early user, you currently use your With room without it being associated to a user account.
        <br />
        For security and privacy, rooms are now associated to user accounts.
        <br />
        Please finalize your account {email} to keep access to your room.
      </div>
      <form onSubmit={onFormSubmit}>
        <div className="u-flex u-sm-flexCol u-flexRow">
          <TextField
            id={`firstName`}
            value={firstName}
            onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}
            placeholderText={'Dorothy'}
            labelText="First Name"
            className={styles.firstName}
          />
          <TextField
            id={`lastName`}
            value={lastName}
            onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
            placeholderText={'Gale'}
            labelText="Last Name"
            className={styles.lastName}
          />
        </div>
        <div className={styles.checkboxes}>
          <CheckBox
            labelText={<span>I agree to the Terms of Service</span>}
            checked={acceptTos}
            onClickHandler={() => setAcceptTos(!acceptTos)}
            checkboxName="terms of service checkbox"
          />
          <CheckBox
            labelText="It’s ok to send me occasional emails"
            checked={sendEmails}
            onClickHandler={() => setSendEmails(!sendEmails)}
            checkboxName="send me occasional emails checkbox"
          />
        </div>
        <Button
          className={styles.button}
          buttonText="Go to my room"
          type={ButtonTypes.SUBMIT}
          isDisabled={firstName.length === 0 || lastName.length === 0 || !acceptTos}
        />
      </form>
    </div>
  );

  return (
    <main className="u-flex u-height100Percent u-flexCol">
      <Header />
      <TwoColLayout
        left={rightCol}
        right={
          <div className={styles.imageContainer}>
            <img className={styles.image} src={signinImg} alt="sign in" />
          </div>
        }
        leftColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter"
        rightColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone"
      />
    </main>
  );
};
