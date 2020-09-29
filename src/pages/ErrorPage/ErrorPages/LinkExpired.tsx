import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';
import LinkBrokenImg from '../images/Link_Broken.png';

interface ILinkExpiredProps {
  errorMsg?: string;
}

export const LinkExpired: React.FC<ILinkExpiredProps> = (props) => {
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
      title="Oops, this link is not valid anymore"
      body="Maybe the link has expired, or was revoked, or maybe you used this link already."
      errorMessage={errorMsg}
      imgSrc={LinkBrokenImg}
      imgAltText="Link expired"
    />
  );
};
