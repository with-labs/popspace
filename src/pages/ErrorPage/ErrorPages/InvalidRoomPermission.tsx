import React from 'react';
import { GenericErrorPage } from './GenericErrorPage';
import { RouteNames } from '../../../constants/RouteNames';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import NoAccessImg from '../images/No_Access.png';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { Button, makeStyles } from '@material-ui/core';
import { removeSessionToken } from '../../../utils/removeSessionToken';

interface IInvalidRoomPermissionProps {
  errorMsg?: string;
}

const useStyles = makeStyles((theme) => ({
  buttonLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: theme.palette.brandColors.ink.regular,
    verticalAlign: 'baseline',
    minWidth: 0,
  },
}));

export const InvalidRoomPermission: React.FC<IInvalidRoomPermissionProps> = (props) => {
  const { errorMsg } = props;
  const history = useHistory();
  const { t } = useTranslation();
  const classes = useStyles();
  const { currentUserProfile, isLoading } = useCurrentUserProfile();

  const onButtonClick = () => {
    history.push(RouteNames.ROOT);
  };

  const onSignOutClick = () => {
    removeSessionToken();
    history.push(RouteNames.SIGN_IN);
  };

  const onSignInClick = () => {
    history.push(RouteNames.SIGN_IN);
  };

  const subMessage = currentUserProfile ? (
    <Trans i18nKey="errorPages.invalidRoom.subMessageNotSignedIn" values={{ email: currentUserProfile.user.email }}>
      You are currently logged is as {currentUserProfile.user.email}
      You might need to
      <Button
        className={classes.buttonLink}
        onClick={onSignOutClick}
        fullWidth={false}
        style={{ backgroundColor: 'transparent' }}
      >
        sign out
      </Button>
      and then sign in with a different email
    </Trans>
  ) : (
    ''
  );

  return (
    <GenericErrorPage
      buttonText={currentUserProfile ? t('errorPages.invalidRoom.buttonText') : t('errorPages.signInBtn')}
      onClick={currentUserProfile ? onButtonClick : onSignInClick}
      quoteText={t('errorPages.invalidRoom.quoteText')}
      title={t('errorPages.invalidRoom.title')}
      body={currentUserProfile ? t('errorPages.invalidRoom.body') : t('errorPages.invalidRoom.bodySignedOut')}
      errorMessage={errorMsg}
      imgSrc={NoAccessImg}
      imgAltText={t('errorPages.invalidRoom.altImgText')}
      subMessage={subMessage}
      isLoading={isLoading}
    />
  );
};
