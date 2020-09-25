import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';

interface IUnexpectedProps {
  errorMsg?: string;
}

// TODO hook up support contact button
export const Unexpected: React.FC<IUnexpectedProps> = (props) => {
  const { errorMsg } = props;
  const history = useHistory();

  const onButtonClick = () => {
    history.push(Routes.ROOT);
  };

  return (
    <GenericErrorPage
      buttonText="Contact Support"
      onClick={onButtonClick}
      quoteText=""
      title="Uh oh!"
      body="Our bad, something went wrong. We could show you some scary error message but you should just let us know :)"
      errorMessage={errorMsg}
      img={''}
    />
  );
};
