import React, { useState, useEffect } from 'react';
import Api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../constants/RouteNames';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { ErrorInfo } from '../../types/api';
import { Page } from '../../Layouts/Page/Page';
import { logger } from '../../utils/logger';
import { getSessionToken } from '../../utils/sessionToken';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { RouteComponentProps } from 'react-router';

interface MatchParams {
  otp: string;
}

export const InviteLink: React.FC<RouteComponentProps<MatchParams>> = (props) => {
  const { otp } = props.match.params;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the invite
  const query = useQueryParams();
  // pull out the information we need from query string
  const iid = query.get('iid') || '';

  useEffect(() => {
    const redirectToFrontPage = (errorCode: string) => {
      if (getSessionToken()) {
        // check to see if the user has a session token stored, if they do
        // then redirect to the dashboard.
        history.push(`${RouteNames.ROOT}?e=${errorCode}`);
      } else {
        // user is not signed in, redirect to the sign in page with invalid link error
        history.push(`${RouteNames.SIGN_IN}?e=${errorCode}`);
      }
    };

    setIsLoading(true);
    Api.roomMembershipThroughPublicInviteLink(otp, iid)
      .then((result) => {
        setIsLoading(false);
        if (result.success) {
          // so assuming user is logged in correctly,
          // redirect to roomRoute
          // redirect using the roomName returned from result to
          history.push(`/${result.roomRoute}`);
        } else if (result.errorCode === ErrorCodes.UNAUTHORIZED_USER) {
          // user tried to use invite link,  but was not logged in
          // redirect to login
          redirectToFrontPage(ErrorCodes.NOT_LOGGED_IN);
        } else if (
          result.errorCode === ErrorCodes.INVALID_INVITE ||
          result.errorCode === ErrorCodes.INVALID_OTP ||
          result.errorCode === ErrorCodes.INVALID_API_PARAMS
        ) {
          // iid is not in the db
          // error to dashboard with message
          redirectToFrontPage(ErrorCodes.INVALID_LINK);
        } else if (result.errorCode === ErrorCodes.REVOKED_OTP) {
          // link has been disabled
          // error to dashboard with message
          redirectToFrontPage(ErrorCodes.INVITE_EXPIRED);
        } else if (result.errorCode === ErrorCodes.TOO_MANY_ROOM_MEMBERS) {
          // max room membership hit
          redirectToFrontPage(ErrorCodes.TOO_MANY_ROOM_MEMBERS);
        } else {
          logger.error(`Error in InviteLink`, result.message, result.errorCode);
          setError({
            errorCode: ErrorCodes.UNEXPECTED,
            error: result,
          });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        logger.error(`Error in InviteLink`, err);
        setError({
          errorCode: ErrorCodes.UNEXPECTED,
          error: err,
        });
      });
  }, [history, otp, iid]);

  return <Page isLoading={isLoading} error={error} />;
};
