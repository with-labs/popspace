import React, { useState, useEffect } from 'react';
import Api from '@utils/api';
import { useHistory, generatePath } from 'react-router-dom';
import { RouteNames } from '@constants/RouteNames';
import useQueryParams from '@hooks/useQueryParams/useQueryParams';
import { ErrorCodes } from '@constants/ErrorCodes';
import { ErrorInfo } from '../../types/api';
import { Page } from '@layouts/Page/Page';
import { logger } from '@utils/logger';
import { getSessionToken, setSessionToken } from '@utils/sessionToken';

interface ILoginWithEmailProps {}

export const LoginWithEmail: React.FC<ILoginWithEmailProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the invite
  const query = useQueryParams();

  // pull out the information we need from query string
  const otp = query.get('otp') || '';
  const uid = query.get('uid') || null;
  const inviteCode = query.get('invite_code') || null;
  const iid = query.get('iid') || null;

  useEffect(() => {
    setIsLoading(true);
    Api.logIn(otp, uid)
      .then((result: any) => {
        setIsLoading(false);
        if (result.success) {
          // user has successfully been signed in so we
          // set the new session token for the user
          setSessionToken(result.token);
          if (inviteCode && iid) {
            // if the login link has invite code info, so we redirect to the invite link flow again
            // to complete the process
            const baseInvitePath = generatePath(RouteNames.INVITE, { inviteCode });
            history.push(`${baseInvitePath}?iid=${iid}`);
          } else {
            // redirect to the root
            history.push(RouteNames.ROOT);
          }
        } else if (result.errorCode === ErrorCodes.INVALID_OTP) {
          // OTP is invalid
          if (getSessionToken()) {
            // check to see if the user has a session token stored, if they do
            // then redirect to the dashboard.
            history.push(`${RouteNames.ROOT}?e=${ErrorCodes.INVALID_LINK}`);
          } else {
            // user is not signed in, redirect to the sign in page with invalid link error
            history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.INVALID_LINK}`);
          }
        } else if (result.errorCode === ErrorCodes.EXPIRED_OTP) {
          // OTP is expired
          // check to see if the user has a session token set
          if (getSessionToken()) {
            // if the user has a session token, its safe to assume they are logged in
            // so kick the user into their dashboard
            history.push(RouteNames.ROOT);
          } else {
            // if the user is not logged in, redirect to signin page with invalid link error
            history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.EXPIRED_OTP}`);
          }
        } else if (result.errorCode === ErrorCodes.RESOLVED_OTP) {
          // OTP has already been claimed
          // this link has already been clicked before
          // check to see if the user has a session token set
          if (getSessionToken()) {
            // if the user has a session token, its safe to assume they are logged in
            // so kick the user into their dashboard
            history.push(RouteNames.ROOT);
          } else {
            // if the user is not logged in, redirect to signin page with invalid link error
            history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.RESOLVED_OTP}`);
          }
        } else {
          logger.error(`Error in LoginWithEmail for ${uid}`, result.message, result.errorCode);
          setError({
            errorCode: ErrorCodes.UNEXPECTED,
            error: result,
          });
        }
      })
      .catch((e: any) => {
        setIsLoading(false);
        logger.error(`Error in LoginWithEmail for ${uid}`, e);
        setError({
          errorCode: ErrorCodes.UNEXPECTED,
          error: e,
        });
      });
  }, [otp, uid, history, inviteCode, iid]);

  return <Page isLoading={isLoading} error={error} />;
};
