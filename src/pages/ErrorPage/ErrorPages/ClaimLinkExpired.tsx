import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { RouteNames } from '../../../constants/RouteNames';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import linkExpiredImg from '../images/Expired_claim_link.png';

interface IClaimLinkExpiredProps {
  errorMsg?: string;
}

export const ClaimLinkExpired: React.FC<IClaimLinkExpiredProps> = (props) => {
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
      quoteText={t('errorPages.claimLinkExpired.quoteText')}
      title={t('errorPages.claimLinkExpired.title')}
      body={t('errorPages.claimLinkExpired.body')}
      errorMessage={errorMsg}
      imgSrc={linkExpiredImg}
      imgAltText={t('errorPages.claimLinkExpired.altImgText')}
    />
  );
};
