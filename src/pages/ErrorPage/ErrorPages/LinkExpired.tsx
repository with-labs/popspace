import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LinkBrokenImg from '../images/Link_Broken.png';

interface ILinkExpiredProps {
  errorMsg?: string;
}

export const LinkExpired: React.FC<ILinkExpiredProps> = (props) => {
  const { errorMsg } = props;
  const history = useHistory();
  const { t } = useTranslation();

  const onButtonClick = () => {
    history.push(Routes.ROOT);
  };

  return (
    <GenericErrorPage
      buttonText={t('errorPages.takeMeHomeBtn')}
      onClick={onButtonClick}
      quoteText={t('errorPages.linkExpired.quoteText')}
      title={t('errorPages.linkExpired.title')}
      body={t('errorPages.linkExpired.body')}
      errorMessage={errorMsg}
      imgSrc={LinkBrokenImg}
      imgAltText={t('errorPages.linkExpired.altImgText')}
    />
  );
};
