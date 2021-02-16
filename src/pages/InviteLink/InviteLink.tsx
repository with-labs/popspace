import React, { useState, useEffect } from 'react';
import Api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../constants/RouteNames';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { ErrorInfo } from '../../types/api';
import { Page } from '../../Layouts/Page/Page';
import { logger } from '../../utils/logger';
import { getSessionToken, setSessionToken } from '../../utils/sessionToken';

interface IInviteLinkProps {
  otp: string;
}

export const InviteLink: React.FC<IInviteLinkProps> = (props) => {
  const { otp } = props;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // TODO: finish hooking this up
  useEffect(() => {
    setIsLoading(true);
    Api.roomMembershipThroughSharableLink(otp)
      .then((result: any) => {
        setIsLoading(false);
        if (result.success) {
        } else if (result.errorCode === ErrorCodes.INVALID_OTP) {
        } else {
          logger.error(`Error in InviteLink`, result.message, result.errorCode);
          setError({
            errorCode: ErrorCodes.UNEXPECTED,
            error: result,
          });
        }
      })
      .catch((e: any) => {
        setIsLoading(false);
        logger.error(`Error in InviteLink`, e);
        setError({
          errorCode: ErrorCodes.UNEXPECTED,
          error: e,
        });
      });
  }, [history, otp]);

  return <Page isLoading={isLoading} error={error} />;
};
