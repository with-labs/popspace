import React from 'react';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import signinImg from '../../images/SignIn.png';
import { Button, Typography, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { isMobileOnly } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';

interface IClaimConfirmationViewProps {
  roomName: string;
  email: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(5),
  },
  title: {
    marginBottom: 10,
  },
}));

export const ClaimConfirmationView: React.FC<IClaimConfirmationViewProps> = (props) => {
  const classes = useStyles();
  const { email, roomName } = props;
  const history = useHistory();
  const { t } = useTranslation();

  const onGotoRoomClick = () => {
    history.push(`/${roomName}`);
  };

  return (
    <TwoColLayout>
      <Column centerContent={true} useColMargin={true}>
        <PanelContainer>
          <Typography variant="h2" className={classes.title}>
            {t('pages.claimConfirmationView.title')}
          </Typography>
          <Typography variant="body1">
            {t('pages.claimConfirmationView.associationText', { roomName, email })}
            <br />
            <br />
            {t('pages.claimConfirmationView.confirmationBody')}
            {isMobileOnly && (
              <>
                <br />
                <br />
                {t('pages.claimConfirmationView.mobileOptimizationNotice')}
              </>
            )}
          </Typography>
          {!isMobileOnly && (
            <Button className={classes.button} onClick={onGotoRoomClick}>
              {t('pages.claimConfirmationView.gotoRoomBtn')}
            </Button>
          )}
        </PanelContainer>
      </Column>
      <Column centerContent={true} hide="sm">
        <PanelImage src={signinImg} altTextKey="pages.claimConfirmationView.imgAltText" />
      </Column>
    </TwoColLayout>
  );
};
