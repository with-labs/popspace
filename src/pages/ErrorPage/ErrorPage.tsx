import React from 'react';
import { ErrorCodes } from '@constants/ErrorCodes';
import { LinkExpired } from './ErrorPages/LinkExpired';
import { InvalidLink } from './ErrorPages/InvalidLink';
import { PageNotFound } from './ErrorPages/PageNotFound';
import { RoomNotFound } from './ErrorPages/RoomNotFound';
import { Unexpected } from './ErrorPages/Unexpected';
interface IErrorPageProps {
  type: ErrorCodes;
  errorMessage?: string;
}

// Master error control, by default it will render an unexpected error.
// will render a dfferent error page based on the error type
export const ErrorPage: React.FC<IErrorPageProps> = (props) => {
  const { type, errorMessage, ...rest } = props;
  switch (type) {
    case ErrorCodes.LINK_EXPIRED:
      return <LinkExpired errorMsg={errorMessage} {...rest} />;
    case ErrorCodes.INVALID_LINK:
      return <InvalidLink errorMsg={errorMessage} {...rest} />;
    case ErrorCodes.PAGE_NOT_FOUND:
      return <PageNotFound errorMsg={errorMessage} {...rest} />;
    case ErrorCodes.ROOM_NOT_FOUND:
      return <RoomNotFound errorMsg={errorMessage} {...rest} />;
    default:
      return <Unexpected errorMsg={errorMessage} {...rest} />;
  }
};
