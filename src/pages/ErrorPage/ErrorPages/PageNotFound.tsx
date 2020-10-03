import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';
import PageNotFoundImg from '../images/404_page.png';

interface IPageNotFoundProps {
  errorMsg?: string;
}

export const PageNotFound: React.FC<IPageNotFoundProps> = (props) => {
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
      title="Lost in Space?"
      body="It seems like you landed on the wrong place. We suggest you back to home."
      errorMessage={errorMsg}
      imgSrc={PageNotFoundImg}
      imgAltText="Page not found"
    />
  );
};
