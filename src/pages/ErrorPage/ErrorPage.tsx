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
  var errorPage = <Unexpected errorMsg={errorMessage} {...rest} />;
  switch (type) {
    case ErrorCodes.LINK_EXPIRED:
      errorPage = <LinkExpired errorMsg={errorMessage} {...rest} />;
      break;
    case ErrorCodes.INVALID_LINK:
      errorPage = <InvalidLink errorMsg={errorMessage} {...rest} />;
      break;
    case ErrorCodes.PAGE_NOT_FOUND:
      errorPage = <PageNotFound errorMsg={errorMessage} {...rest} />;
      break;
    case ErrorCodes.ROOM_NOT_FOUND:
      errorPage = <RoomNotFound errorMsg={errorMessage} {...rest} />;
      break;
    case ErrorCodes.UNEXPECTED:
      errorPage = <Unexpected errorMsg={errorMessage} {...rest} />;
      break;
  }

  return errorPage;
};
