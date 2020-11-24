import React, { useState, useEffect, useMemo } from 'react';
import Api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../constants/RouteNames';
import { USER_SESSION_TOKEN } from '../../constants/User';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';
import { Page } from '../../Layouts/Page/Page';
import { logger } from '../../utils/logger';

interface IVerifyEmailProps {}

export const VerifyEmail: React.FC<IVerifyEmailProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the url
  const query = useQueryParams();

  const otp = useMemo(() => query.get('otp'), [query]);
  const email = useMemo(() => query.get('email'), [query]);

  useEffect(() => {
    setIsLoading(true);
    if (!otp || !email) {
      history.push(RouteNames.ROOT);
    } else {
      Api.completeSignup(otp, email)
        .then((result: any) => {
          setIsLoading(false);
          if (result.succuess) {
            window.localStorage.setItem(USER_SESSION_TOKEN, result.token);
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
          logger.error(`Error verifying email for ${email}`, e);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [history, otp, email]);

  return <Page isLoading={isLoading} error={error} />;
};
