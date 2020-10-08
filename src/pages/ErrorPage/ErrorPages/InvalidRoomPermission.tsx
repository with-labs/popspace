import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';

import NoAccessImg from '../images/No_Access.png';

interface IInvalidRoomPermissionProps {
  errorMsg?: string;
}

export const InvalidRoomPermission: React.FC<IInvalidRoomPermissionProps> = (props) => {
  const { errorMsg } = props;
  const history = useHistory();

  const onButtonClick = () => {
    history.push(Routes.ROOT);
  };
  return (
    <GenericErrorPage
      buttonText="Take me Home"
      onClick={onButtonClick}
      quoteText=""
      title="You don’t have access to this room."
      body="Please contact the room host for more details."
      errorMessage={errorMsg}
      imgSrc={NoAccessImg}
      imgAltText="No access"
    />
  );
};
