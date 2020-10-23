import React, { useState, useEffect, useMemo } from 'react';
import Api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { USER_SESSION_TOKEN } from '../../constants/User';
import * as Sentry from '@sentry/react';
import useQuery from '../../withHooks/useQuery/useQuery';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';
import { Page } from '../../Layouts/Page/Page';

interface IVerifyEmailProps {}

export const VerifyEmail: React.FC<IVerifyEmailProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the url
  const query = useQuery();

  const otp = useMemo(() => query.get('otp'), [query]);
  const email = useMemo(() => query.get('email'), [query]);

  useEffect(() => {
    setIsLoading(true);
    if (!otp || !email) {
      history.push(Routes.ROOT);
    } else {
      Api.completeSignup(otp, email)
        .then((result: any) => {
          setIsLoading(false);
          if (result.succuess) {
            window.localStorage.setItem(USER_SESSION_TOKEN, result.token);
            history.push(Routes.ROOT);
          } else {
            setError({
              errorType: ErrorTypes.LINK_EXPIRED,
              error: result,
            });
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error verifying email for ${email}`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [history, otp, email]);

  return <Page isLoading={isLoading} error={error} />;
};
