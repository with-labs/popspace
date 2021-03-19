import { Box, Button, Typography } from '@material-ui/core';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonLoader } from '../../../components/ButtonLoader/ButtonLoader';
import { Logo } from '../../../components/Logo/Logo';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { logger } from '../../../utils/logger';

export interface IRequestPermissionsStepProps {
  onComplete: (isPermissionsSet: boolean) => void;
}

export const RequestPermissionsStep: React.FC<IRequestPermissionsStepProps> = ({ onComplete }) => {
  const { t } = useTranslation();

  const [isRequesting, setIsRequesting] = React.useState(false);

  const { user } = useCurrentUserProfile();
  const userId = user?.id;

  const requestAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setIsRequesting(true);

      // setIsLoading(true);
      stream.getTracks().forEach(function (track) {
        if (track.readyState === 'live') {
          track.stop();
        }
      });

      // forwhat ever reason, when we are calling stop the track isnt throwing the
      // appropriate events, so we are just going to call a timer to pop a loading screen
      // until we re-work our track to accept mediastream tracks as an inital stream
      setTimeout(() => {
        setIsRequesting(false);
        onComplete(true);
      }, 4000);
    } catch (err) {
      setIsRequesting(false);
      if (err.name === 'NotAllowedError') {
        // user denied our request - for now we still let them in.
        logger.warn(`User (id: ${userId}) denied permission to media device`);
        // let them though, we will prompt them to fix their permissions if they attempt to
        // user the mic / camera after the fact
        onComplete(false);
      } else if (err.name === 'NotFoundError') {
        // user doesnt have any devices
        logger.warn(`User (id: ${userId}) no media devices found`);

        // let them though, we will tell the user we cannot detect the
        // user the mic / camera when they try to use them.
        onComplete(false);
      } else {
        /* handle the error */
        logger.error(`Error getting user media for user (id: ${userId})`);
        //TODO: should not fail silently, should throw an error.
      }
      // TODO: add in a case where we detect if we are running locally and on
      // an iphone simulator to just let us though, since the sim wont allow us to get devices and
      // throws and unconstranded error. should just pass though and log a message in the console about this
      // problem in the iphone sim
    }
  };

  return (
    <Box minHeight="100%" display="flex" flexDirection="column">
      <Box flex={1} width="100%">
        <Logo style={{ marginBottom: 16 }} />
        <Typography variant="h1" style={{ marginBottom: 72 }}>
          {t('modals.devicePermissionsModal.title')}
        </Typography>
        <Typography paragraph>
          <Trans i18nKey="modals.devicePermissionsModal.permissionExplanationText" />
        </Typography>
      </Box>
      <Button onClick={requestAccess} fullWidth disabled={isRequesting}>
        {isRequesting ? <ButtonLoader /> : t('modals.devicePermissionsModal.requestPermissionsButton')}
      </Button>
    </Box>
  );
};
