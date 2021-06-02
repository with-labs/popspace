import { Hidden, makeStyles, Paper, Theme, useMediaQuery, Box } from '@material-ui/core';
import clsx from 'clsx';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsivePopoverProvider } from '@components/ResponsivePopover/ResponsivePopover';
import { Spacing } from '@components/Spacing/Spacing';
import { MediaFailedWrapper } from '@roomState/MediaFailedWrapper';
import { isPIPAvailable } from '../../pictureInPicture/pictureInPictureFeatureDetection';
import { ACTION_BAR_ID } from '../addContent/ActionBar';
import { FloatingActionBarButton } from '../addContent/FloatingActionBarButton';
import { PublishedCameraToggle } from '../media/PublishedCameraToggle';
import { PublishedMicToggle } from '../media/PublishedMicToggle';
import { PictureInPictureToggle } from '../media/PictureInPictureToggle';
import { ScreenShareToggle } from '../media/ScreenShareToggle';
import { LeaveMeetingButton } from './LeaveMeetingButton/LeaveMeetingButton';
import { CopyLinkButton } from './CopyLinkButton/CopyLinkButton';

export interface IRoomTaskbarProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: '1fr',
    padding: theme.spacing(1),
    position: 'relative',
    zIndex: theme.zIndex.modal - 1,
  },
  floatingActionButton: {
    position: 'fixed',
    bottom: 60 + theme.spacing(2),
    right: theme.spacing(2),
    borderRadius: '100%',
    width: 56,
    height: 56,
  },
}));

export const RoomTaskbar: React.FC<IRoomTaskbarProps> = ({ className, ...rest }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [hasPip] = useFeatureFlag('pictureInPicture');

  return (
    <>
      <ResponsivePopoverProvider value={'top'}>
        <Paper square elevation={5} className={clsx(classes.root, className)} {...rest}>
          <Box width={150} display="flex" alignItems="center">
            LOGO FPO
          </Box>
          <Spacing gap={2} flexDirection={'row'} alignItems="center" justifyContent="center" flex={1}>
            <MediaFailedWrapper>
              <Spacing gap={0.5} alignItems="center" color="grey.900" flexDirection={'row'}>
                <PublishedCameraToggle />
                <PublishedMicToggle />
                <Hidden xsDown>
                  <ScreenShareToggle />
                  {isPIPAvailable && hasPip && <PictureInPictureToggle />}
                </Hidden>
              </Spacing>
            </MediaFailedWrapper>
          </Spacing>
          <Spacing gap={0.5} alignItems="center" justifyContent="flex-end" color="grey.900" flexDirection={'row'}>
            <CopyLinkButton />
            <LeaveMeetingButton />
          </Spacing>
        </Paper>
      </ResponsivePopoverProvider>
      <Hidden mdUp>
        <FloatingActionBarButton
          aria-label={t('features.omnibar.quickActionButton')}
          aria-controls={ACTION_BAR_ID}
          className={classes.floatingActionButton}
        />
      </Hidden>
    </>
  );
};
