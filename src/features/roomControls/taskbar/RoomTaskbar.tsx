import { Hidden, makeStyles, Paper } from '@material-ui/core';
import clsx from 'clsx';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsivePopoverProvider } from '@components/ResponsivePopover/ResponsivePopover';
import { Spacing } from '@components/Spacing/Spacing';
import { MediaFailedWrapper } from '@providers/media/MediaFailedWrapper';
import { isPIPAvailable } from '../../pictureInPicture/pictureInPictureFeatureDetection';
import { ACTION_BAR_ID } from '../addContent/ActionBar';
import { FloatingActionBarButton } from '../addContent/FloatingActionBarButton';
import { PublishedCameraToggle } from '../media/PublishedCameraToggle';
import { PublishedMicToggle } from '../media/PublishedMicToggle';
import { PictureInPictureToggle } from '../media/PictureInPictureToggle';
import { ScreenShareToggle } from '../media/ScreenShareToggle';
import { LeaveMeetingButton } from './LeaveMeetingButton/LeaveMeetingButton';
import { CopyLinkButton } from './CopyLinkButton/CopyLinkButton';
import { Logo } from '@components/Logo/Logo';
export interface IRoomTaskbarProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    position: 'relative',
    zIndex: theme.zIndex.modal - 1,
    '& > *': {
      flex: '1 0 0',
    },
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
          <Logo width={75} style={{ marginLeft: 8 }} link />

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
