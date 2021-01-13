import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import UnexpectedImg from '../images/Unexpected.png';
import { Links } from '../../../constants/Links';
import { useTranslation } from 'react-i18next';

interface IUnexpectedProps {
  errorMsg?: string;
}

export const Unexpected: React.FC<IUnexpectedProps> = (props) => {
  const { errorMsg, ...rest } = props;
  const { t } = useTranslation();

  const onButtonClick = () => {
    // open a new tab to the feedback page
    window.open(Links.FEEDBACK, '_blank');
  };

  return (
    <GenericErrorPage
      {...rest}
      buttonText={t('errorPages.contactSupportBtn')}
      onClick={onButtonClick}
      quoteText={t('errorPages.unexpected.quoteText')}
      title={t('errorPages.unexpected.title')}
      body={t('errorPages.unexpected.body')}
      errorMessage={errorMsg}
      imgSrc={UnexpectedImg}
      imgAltText={t('errorPages.unexpected.altImgText')}
    />
  );
};
