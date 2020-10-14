import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { Routes } from '../../../constants/Routes';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NoAccessImg from '../images/No_Access.png';

interface IInvalidRoomPermissionProps {
  errorMsg?: string;
}

export const InvalidRoomPermission: React.FC<IInvalidRoomPermissionProps> = (props) => {
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
      quoteText={t('errorPages.invalidRoom.quoteText')}
      title={t('errorPages.invalidRoom.title')}
      body={t('errorPages.invalidRoom.body')}
      errorMessage={errorMsg}
      imgSrc={NoAccessImg}
      imgAltText={t('errorPages.invalidRoom.altImgText')}
    />
  );
};
