import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import UnexpectedImg from '../images/Unexpected.png';
import { RouteNames } from '@constants/RouteNames';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
interface IUnexpectedProps {
  errorMsg?: string;
}

export const Unexpected: React.FC<IUnexpectedProps> = (props) => {
  const { errorMsg, ...rest } = props;
  const { t } = useTranslation();
  const history = useHistory();

  const onButtonClick = () => {
    history.push(RouteNames.ROOT);
  };

  return (
    <GenericErrorPage
      {...rest}
      buttonText={t('common.confirm')}
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
