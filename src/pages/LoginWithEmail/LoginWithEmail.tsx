import React, { useState, useEffect, useMemo } from 'react';
import Api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { USER_SESSION_TOKEN } from '../../constants/User';
import * as Sentry from '@sentry/react';
import { CircularProgress } from '@material-ui/core';
import useQuery from '../../withHooks/useQuery/useQuery';

interface ILoginWithEmailProps {}

export const LoginWithEmail: React.FC<ILoginWithEmailProps> = (props) => {
  const history = useHistory();

  // get the query params from the invite
  const query = useQuery();

  // pull out the information we need from query string
  //if we dont have the params, redirect to root
  const otp = useMemo(() => query.get('otp'), [query]);
  const uid = useMemo(() => query.get('uid'), [query]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // if opt, or the user id is empty, redirect to root
    if (!otp || !uid) {
      history.push(`/${Routes.ROOT}`);
    } else {
      Api.logIn(otp, uid)
        .then((result: any) => {
          setIsLoading(false);
          if (result.success) {
            window.localStorage.setItem(USER_SESSION_TOKEN, result.token);
            history.push(`/${Routes.ROOT}`);
          } else {
            // TODO: make better error experienced
            setError(result.message);
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error using room for ${uid}`, Sentry.Severity.Error);
          setError(e.message);
        });
    }
  }, [history, otp, uid]);

  return (
    <div>
      {isLoading ? (
        <div className="u-flex u-flexJustifyCenter u-flexAlignItemsCenter u-height100Percent">
          <CircularProgress />
        </div>
      ) : (
        <div>error : {error}</div>
      )}
    </div>
  );
};
