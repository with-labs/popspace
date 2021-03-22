import { Box, Button, Typography } from '@material-ui/core';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonLoader } from '../../../components/ButtonLoader/ButtonLoader';
import { Logo } from '../../../components/Logo/Logo';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { logger } from '../../../utils/logger';
import { useAppState } from '../../../state';
import { MediaError, MEDIA_TYPES, MEDIA_STATUS } from '../../../errors/MediaError';
import { isIOS } from 'react-device-detect';

export interface IRequestPermissionsStepProps {
  onComplete: (isPermissionsSet: boolean) => void;
}

export const RequestPermissionsStep: React.FC<IRequestPermissionsStepProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { setError } = useAppState();

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
      } else if (process.env.REACT_APP_SIM_PASS && isIOS) {
        // if sim_pass is active and we detect we are on an IOS device
        // assume we are in hitting this from a simulator from local dev,
        // since the simulator doesnt have access to the the camera or mic,
        // we will continue with a console message.
        console.log('DEV NOTICE - Simulator pass through for media device request used');
        onComplete(false);
      } else {
        /* handle the error */
        logger.error(`Error getting user media for user (id: ${userId})`);
        //throw an error to the user
        setError(new MediaError('', MEDIA_TYPES.UNEXPECTED_MEDIA, MEDIA_STATUS.DENIED));
      }
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
