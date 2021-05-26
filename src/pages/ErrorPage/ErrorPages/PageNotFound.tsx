import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { RouteNames } from '@constants/RouteNames';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageNotFoundImg from '../images/404_page.png';

interface IPageNotFoundProps {
  errorMsg?: string;
}

export const PageNotFound: React.FC<IPageNotFoundProps> = (props) => {
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
      quoteText={t('errorPages.pageNotFound.quoteText')}
      title={t('errorPages.pageNotFound.title')}
      body={t('errorPages.pageNotFound.body')}
      errorMessage={errorMsg}
      imgSrc={PageNotFoundImg}
      imgAltText={t('errorPages.pageNotFound.altImgText')}
    />
  );
};
