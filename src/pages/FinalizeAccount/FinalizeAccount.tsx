import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import styles from './FinalizeAccount.module.css';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { CircularProgress } from '@material-ui/core';
import useQuery from '../../withHooks/useQuery/useQuery';

import Api from '../../utils/api';
import * as Sentry from '@sentry/react';

import { Routes } from '../../constants/Routes';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { USER_SESSION_TOKEN } from '../../constants/User';

import { Header } from '../../withComponents/Header/Header';
import signinImg from '../../images/SignIn.png';
import { Button, TextField } from '@material-ui/core';
import { CheckboxField } from '../../withComponents/CheckboxField/CheckboxField';

interface IFinalizeAccountProps {}

export const FinalizeAccount: React.FC<IFinalizeAccountProps> = (props) => {
  const history = useHistory();

  // get the query params from the invite
  const query = useQuery();

  // pull out the information we need from query string
  //if we dont have the params, redirect to root
  const otp = useMemo(() => query.get('otp'), [query]);
  const email = useMemo(() => query.get('email'), [query]);
  const claimId = useMemo(() => query.get('cid'), [query]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    debugger;
    // if opt, email , or the claim id is empty, redirect to root
    if (!otp || !email || !claimId) {
      history.push(`/${Routes.ROOT}`);
    } else {
      // check to see if the room has already been claimed
      const existingToken = window.localStorage.getItem(USER_SESSION_TOKEN);
      Api.resolveRoomClaim(existingToken, otp, claimId)
        .then((result: any) => {
          if (result.success) {
            if (result.newSessionToken) {
              window.localStorage.setItem(USER_SESSION_TOKEN, result.newSessionToken);
            }
            // redirect to the room
            history.push(`/${result.roomName}`);
          } else {
            if (result.errorCode === ErrorCodes.CLAIM_FAIL_NO_SUCH_USER) {
              // the room is unclaimed, but the user isnt create,
              //  so we render the finialize form to finish creating the user
              setIsLoading(false);
            } else {
              setIsLoading(false);
              Sentry.captureMessage(`Error claiming room for ${email}`, Sentry.Severity.Error);
              setError(result.message);
            }
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error claiming room for ${email}`, Sentry.Severity.Error);
          setError(e.message);
        });
    }
  }, [history, otp, email, claimId]);

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const existingToken = window.localStorage.getItem(USER_SESSION_TOKEN);

    const data = {
      firstName,
      lastName,
      email,
      acceptTos,
      receiveMarketing,
    };

    if (!otp || !claimId) {
      Sentry.captureMessage(`Error finializing accoung for ${email}`, Sentry.Severity.Error);
      setError('An error has occurred, please try again later');
    } else {
      // Note: currently for alpha users or users we send invites out to, this registers the room
      // to their account. There will be a seperate api endpoint for when we do this same flow via user invites
      const result: any = await Api.registerThroughClaim(existingToken, data, otp, claimId);
      if (result.success) {
        if (result.newSessionToken) {
          window.localStorage.setItem(USER_SESSION_TOKEN, result.newSessionToken);
        }
        // redirect to the room
        history.push(`/${result.roomName}`);
      } else {
        Sentry.captureMessage(`Error finializing accoung for ${email}`, Sentry.Severity.Error);
        setError('An error has occurred, please try again later');
      }
    }
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
        <div className={styles.checkboxes}>
          <CheckboxField
            label={<span>I agree to the Terms of Service</span>}
            checked={acceptTos}
            onChange={() => setAcceptTos(!acceptTos)}
            name="terms of service checkbox"
          />
          <CheckboxField
            label="It’s ok to send me occasional emails"
            checked={receiveMarketing}
            onChange={() => setReceiveMarketing(!receiveMarketing)}
            name="send me occasional emails checkbox"
          />
        </div>
        <Button className={styles.button} type="submit" disabled={!firstName || !lastName || !acceptTos}>
          Go to my room
        </Button>
        {error ? <div className={styles.errorMsg}>{error}</div> : null}
      </form>
    </div>
  );

  return (
    <main className="u-flex u-height100Percent u-flexCol">
      <Header />
      {isLoading ? (
        <div className="u-flex u-flexJustifyCenter u-flexAlignItemsCenter u-height100Percent">
          <CircularProgress />
        </div>
      ) : (
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
      )}
      ;
    </main>
  );
};
