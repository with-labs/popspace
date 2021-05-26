import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles, Box, Typography, Button } from '@material-ui/core';
import { ButtonLoader } from '@components/ButtonLoader/ButtonLoader';
import { logger } from '@utils/logger';
import { useAppState } from '../../../state';
import { useCurrentUserProfile } from '@hooks/api/useCurrentUserProfile';
import { MediaError, MEDIA_TYPES, MEDIA_STATUS } from '../../../errors/MediaError';
import { isIOS } from 'react-device-detect';
import permissionsBg from '../../../images/illustrations/browser_permission.gif';
import permissionsMobileBg from '../../../images/illustrations/browser_permission_responsive.jpg';
import textureEdge from '../../../images/illustrations/textured_side_transparent.png';
import { isMobileOnly } from 'react-device-detect';
import { Logo } from '@components/Logo/Logo';

export interface IRequestPermissionsProps {
  onComplete: (isPermissionsSet: boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100vh',
    overflow: 'hidden',

    [theme.breakpoints.up('md')]: {
      height: '100vh',
    },
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    display: 'grid',
    gridTemplateAreas: '"content image"',
    gridTemplateColumns: 'minmax(auto, 500px) 1fr',
    gridGap: theme.spacing(4),
    overflow: 'hidden',

    [theme.breakpoints.down('sm')]: {
      gridTemplateAreas: '"image" "content"',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '260px 1fr',
    },
  },
  mobileRoot: {
    minHeight: '100%',
    height: '100%',
  },
  content: {
    gridArea: 'content',
    overflow: 'auto',
    [theme.breakpoints.down('md')]: {
      overflow: 'hidden',
      height: '100%',
    },
  },
  graphic: {
    gridArea: 'image',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    backgroundImage: `url(${permissionsBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 'auto',
      width: 16,
      zIndex: 1,
      backgroundImage: `url(${textureEdge})`,
      backgroundRepeat: 'repeat-y',
      backgroundSize: 'contain',
    },

    [theme.breakpoints.down('md')]: {
      backgroundImage: `url(${permissionsMobileBg})`,

      '&::before': {
        display: 'none',
      },
    },
  },
}));

export const RequestPermissions: React.FC<IRequestPermissionsProps> = ({ onComplete }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { setError } = useAppState();

  const [isRequesting, setIsRequesting] = useState(false);

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
        // eslint-disable-next-line no-console
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
    <main className={classes.root}>
      <Box className={isMobileOnly ? classes.mobileRoot : classes.contentWrapper}>
        <Box className={classes.content} p={6} bgcolor="white" height="100%">
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
        </Box>
        <Box className={classes.graphic}>
          <div className={classes.image} />
        </Box>
      </Box>
    </main>
  );
};
