import React, { useState, useEffect, useMemo } from 'react';
import Api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../constants/RouteNames';
import { USER_SESSION_TOKEN } from '../../constants/User';
import * as Sentry from '@sentry/react';
import useQuery from '../../withHooks/useQuery/useQuery';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';
import { Page } from '../../Layouts/Page/Page';

interface ILoginWithEmailProps {}

export const LoginWithEmail: React.FC<ILoginWithEmailProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the invite
  const query = useQuery();

  // pull out the information we need from query string
  //if we dont have the params, redirect to root
  const otp = useMemo(() => query.get('otp'), [query]);
  const uid = useMemo(() => query.get('uid'), [query]);

  useEffect(() => {
    setIsLoading(true);
    // if opt, or the user id is empty, redirect to root
    if (!otp || !uid) {
      history.push(RouteNames.ROOT);
    } else {
      Api.logIn(otp, uid)
        .then((result: any) => {
          setIsLoading(false);
          if (result.success) {
            // set the session token
            window.localStorage.setItem(USER_SESSION_TOKEN, result.token);
            // redirect to the root
            history.push(RouteNames.ROOT);
          } else {
            setError({
              errorType: ErrorTypes.LINK_EXPIRED,
              error: result,
            });
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error using room for ${uid}`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [history, otp, uid]);

  return <Page isLoading={isLoading} error={error} />;
};
