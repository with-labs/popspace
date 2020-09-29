import React from 'react';
import { ErrorTypes } from '../../constants/ErrorType';
import { InvalidRoomPermission } from './ErrorPages/InvalidRoomPermission';
import { LinkExpired } from './ErrorPages/LinkExpired';
import { PageNotFound } from './ErrorPages/PageNotFound';
import { RoomNotFound } from './ErrorPages/RoomNotFound';
import { Unexpected } from './ErrorPages/Unexpected';

interface IErrorPageProps {
  type: ErrorTypes;
  errorMessage?: string;
}

// Master error control, by default it will render an unexpected error.
// will render a dfferent error page based on the error type
export const ErrorPage: React.FC<IErrorPageProps> = (props) => {
  const { type, errorMessage } = props;
  var errorPage = <Unexpected errorMsg={errorMessage} />;
  switch (type) {
    case ErrorTypes.INVALID_ROOM_PERMISSIONS:
      errorPage = <InvalidRoomPermission errorMsg={errorMessage} />;
      break;
    case ErrorTypes.LINK_EXPIRED:
      errorPage = <LinkExpired errorMsg={errorMessage} />;
      break;
    case ErrorTypes.PAGE_NOT_FOUND:
      errorPage = <PageNotFound errorMsg={errorMessage} />;
      break;
    case ErrorTypes.ROOM_NOT_FOUND:
      errorPage = <RoomNotFound errorMsg={errorMessage} />;
      break;
    case ErrorTypes.UNEXPECTED:
      errorPage = <Unexpected errorMsg={errorMessage} />;
      break;
  }

  return errorPage;
};
