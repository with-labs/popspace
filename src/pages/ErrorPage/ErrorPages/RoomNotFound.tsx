import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoomNotFoundImg from '../images/Room_not_found.png';

interface IRoomNotFoundProps {
  errorMsg?: string;
}

export const RoomNotFound: React.FC<IRoomNotFoundProps> = (props) => {
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
      quoteText={t('errorPages.roomNotFound.quoteText')}
      title={t('errorPages.roomNotFound.title')}
      body={t('errorPages.roomNotFound.body')}
      errorMessage={errorMsg}
      imgSrc={RoomNotFoundImg}
      imgAltText={t('errorPages.roomNotFound.altImgText')}
    />
  );
};
