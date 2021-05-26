import React, { useState, useEffect, useMemo } from 'react';
import Api from '@utils/api';
import { useHistory, generatePath } from 'react-router-dom';
import { RouteNames } from '@constants/RouteNames';
import useQueryParams from '@hooks/useQueryParams/useQueryParams';
import { ErrorCodes } from '@constants/ErrorCodes';
import { ErrorInfo } from '../../types/api';
import { Page } from '@layouts/Page/Page';
import { logger } from '@utils/logger';
import { setSessionToken } from '@utils/sessionToken';

import { Analytics } from '@analytics/Analytics';
import { EventNames, Origin } from '@analytics/constants';

interface IVerifyEmailProps {}

export const VerifyEmail: React.FC<IVerifyEmailProps> = (props) => {
  const history = useHistory<{ ref?: string | null }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the url
  const query = useQueryParams();

  const otp = useMemo(() => query.get('otp'), [query]);
  const email = useMemo(() => query.get('email'), [query]);
  const inviteCode = query.get('invite_code') || null;
  const iid = query.get('iid') || null;

  /*
    accept a variety of ways to communicate the origin of the signup.
    Many website add a ?ref=xyz param, but ?utm_source=xyz is also popular.
    Internally we'll use ref, e.g. from the landing page,
    but this list can expand to accommodate more sources.
  */
  const queryRef = query.get('ref') || query.get('utm_source') || null;

  // TODO: when we have signup, update this to specs like loginWithEmail
  useEffect(() => {
    setIsLoading(true);
    if (!otp || !email) {
      history.push(RouteNames.ROOT, { ref: queryRef });
    } else {
      Api.completeSignup(otp, email)
        .then((result) => {
          setIsLoading(false);
          if (result.success) {
            setSessionToken(result.token);
            if (inviteCode && iid) {
              Analytics.trackEvent(EventNames.ONBOARDING_CONFIRM_EMAIL, { ref: queryRef, origin: Origin.INVITE });
              // the user signed up from an invite code, so we move them over to the invite flow
              // to complete the process
              const baseInvitePath = generatePath(RouteNames.INVITE, { inviteCode });
              history.push(`${baseInvitePath}?iid=${iid}`, { ref: queryRef });
            } else {
              Analytics.trackEvent(EventNames.ONBOARDING_CONFIRM_EMAIL, { ref: queryRef });
              // otherwise we send them to their dashboard
              history.push(RouteNames.ROOT, { ref: queryRef });
            }
          } else {
            setError({
              errorCode: ErrorCodes.INVALID_LINK,
              error: result,
            });
          }
        })
        .catch((e) => {
          setIsLoading(false);
          logger.error(`Error verifying email for ${email}`, e);
          setError({
            errorCode: ErrorCodes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [history, otp, email, inviteCode, iid, queryRef]);

  return <Page isLoading={isLoading} error={error} />;
};
