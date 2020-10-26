import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import { Button, TextField } from '@material-ui/core';
import { Header } from '../../withComponents/Header/Header';
import * as Sentry from '@sentry/react';
import Api from '../../utils/api';
import { RouteNames } from '../../constants/RouteNames';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';

import { USER_SESSION_TOKEN } from '../../constants/User';
import { sessionTokenExists } from '../../utils/SessionTokenExists';

import styles from './Admin.module.css';
import { ClaimEmailsTable } from './ClaimEmailsTable';
import { Page } from '../../Layouts/Page/Page';

interface IAdminProps {}

export const Admin: React.FC<IAdminProps> = (props) => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [roomName, setRoomName] = useState('');
  const [users] = useState<{ email: string; room: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo>(null!);

  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

  useEffect(() => {
    if (sessionTokenExists(sessionToken)) {
      Api.getProfile(sessionToken)
        .then((result: any) => {
          if (result.success && result.profile.user.admin) {
            setIsLoading(false);
          } else {
            history.push(RouteNames.ROOT);
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error calling api call getProfile on admin page`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    } else {
      // we arent logged in so redirect to the sign in page
      history.push(RouteNames.SIGN_IN);
    }
  }, [history, sessionToken]);

  const sendEmail = async (email: string, roomName: string) => {
    const result: any = await Api.adminCreateAndSendClaimEmail(sessionToken, email, roomName);
    if (result.success) {
      alert(`Email to ${email} sent!`);
    } else {
      alert(result.message + ' ' + result.errorCode);
    }
  };

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendEmail(email, roomName);
  };

  const resendEmail = async (email: string, roomName: string) => {
    sendEmail(email, roomName);
  };

  return (
    <Page isLoading={isLoading} error={error}>
      <Header text="Admin" />
      <div className="u-flex u-flexJustifyCenter">
        <div className="u-flex u-flexCol u-size4of5">
          <form onSubmit={onFormSubmit}>
            <div className="u-flex u-sm-flexCol u-flexRow u-flexJustifyCenter u-flexAlignItemsCenter u-width100Percent">
              <TextField
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                label="Email"
                className={'u-sm-sizeFull'}
              />
              <TextField
                id="roomName"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                label="Room Name"
                className={clsx(styles.field, 'u-sm-sizeFull')}
              />
              <Button
                className={clsx(styles.button, 'u-sm-sizeFull')}
                type="submit"
                disabled={email.length === 0 || roomName.length === 0}
              >
                Send invite
              </Button>
            </div>
          </form>
          <ClaimEmailsTable sessionToken={sessionToken} resendEmail={resendEmail} />
        </div>
      </div>
    </Page>
  );
};
