import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import UnexpectedImg from '../images/Unexpected.png';
import { Links } from '../../../constants/Links';

interface IUnexpectedProps {
  errorMsg?: string;
}

export const Unexpected: React.FC<IUnexpectedProps> = (props) => {
  const { errorMsg } = props;

  const onButtonClick = () => {
    // open a new tab to the feedback page
    window.open(Links.FEEDBACK, '_blank');
  };

  return (
    <GenericErrorPage
      buttonText="Contact Support"
      onClick={onButtonClick}
      quoteText=""
      title="Uh oh!"
      body="Our bad, something went wrong. We could show you some scary error message but you should just let us know :)"
      errorMessage={errorMsg}
      imgSrc={UnexpectedImg}
      imgAltText="Unexpected"
    />
  );
};
