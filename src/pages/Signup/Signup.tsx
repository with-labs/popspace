// TODO: WIP
import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Signup.module.css';
import Api from '../../utils/api';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';

import { Header } from '../../withComponents/Header/Header';
import { Button, TextField, Link, CircularProgress } from '@material-ui/core';
import { CheckboxField } from '../../withComponents/CheckboxField/CheckboxField';
import { ErrorPage } from '../ErrorPage/ErrorPage';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types';
import { Links } from '../../constants/Links';
import signinImg from '../../images/SignIn.png';

interface ISignupProps {}

export const Signup: React.FC<ISignupProps> = (props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);
  const [isLoading, setIsLoading] = useState(false);

  const onFormSubmit = () => {};

  return error ? (
    <ErrorPage type={error.errorType} errorMessage={error.error?.message} />
  ) : (
    <main className="u-flex u-height100Percent u-flexCol">
      <Header />
      {isLoading ? (
        <div className="u-flex u-flexJustifyCenter u-flexAlignItemsCenter u-height100Percent">
          <CircularProgress />
        </div>
      ) : (
        <TwoColLayout>
          <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter">
            <div className={clsx(styles.container, 'u-flex u-flexCol')}>
              <div className={clsx(styles.title, 'u-fontH1')}>Create an account</div>
              <form onSubmit={onFormSubmit}>
                <div className="u-flex u-sm-flexCol u-flexRow">
                  <TextField
                    id="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Dorothy"
                    label="First Name"
                    className={styles.firstName}
                  />
                  <TextField
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Gale"
                    label="Last Name"
                    className={styles.lastName}
                  />
                </div>
                <div>
                  <TextField
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="dorothy@emerald.city"
                    label="Email"
                    className={styles.lastName}
                  />
                </div>
                <div className={styles.checkboxes}>
                  <CheckboxField
                    label={
                      <span>
                        I agree to the{' '}
                        <Link href={Links.TOS} target="_blank" rel="noopener noreferrer">
                          Terms of Service
                        </Link>
                      </span>
                    }
                    checked={acceptTos}
                    onChange={() => setAcceptTos(!acceptTos)}
                    name="terms of service checkbox"
                  />
                  <CheckboxField
                    label="It’s ok to send me occasional emails"
                    checked={receiveMarketing}
                    onChange={() => setReceiveMarketing(!receiveMarketing)}
                    name="end me occasional emails checkbox"
                  />
                </div>
                <Button className={styles.button} type="submit" disabled={!firstName || !lastName || !acceptTos}>
                  Sign in with email
                </Button>
              </form>
            </div>
          </Column>
          <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone">
            <div className={styles.imageContainer}>
              <img className={styles.image} src={signinImg} alt="sign in" />
            </div>
          </Column>
        </TwoColLayout>
      )}
    </main>
  );
};
