import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { RouteNames } from '@constants/RouteNames';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LinkBrokenImg from '../images/Link_Broken.png';

interface IInvalidLinkProps {
  errorMsg?: string;
}

export const InvalidLink: React.FC<IInvalidLinkProps> = (props) => {
  const { errorMsg, ...rest } = props;
  const history = useHistory();
  const { t } = useTranslation();

  const onButtonClick = () => {
    history.push(RouteNames.ROOT);
  };

  return (
    <GenericErrorPage
      {...rest}
      buttonText={t('errorPages.takeMeHomeBtn')}
      onClick={onButtonClick}
      quoteText={t('errorPages.invalidLink.quoteText')}
      title={t('errorPages.invalidLink.title')}
      body={t('errorPages.invalidLink.body')}
      errorMessage={errorMsg}
      imgSrc={LinkBrokenImg}
      imgAltText={t('errorPages.invalidLink.altImgText')}
    />
  );
};
