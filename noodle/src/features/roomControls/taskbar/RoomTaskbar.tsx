import { Logo } from '@components/Logo/Logo';
import { ResponsivePopoverProvider } from '@components/ResponsivePopover/ResponsivePopover';
import { Spacing } from '@components/Spacing/Spacing';
import { Box, Hidden, makeStyles, Paper } from '@material-ui/core';
import clsx from 'clsx';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ACTION_BAR_ID } from '../addContent/ActionBar';
import { FloatingActionBarButton } from '../addContent/FloatingActionBarButton';
import { PublishedCameraToggle } from '../media/PublishedCameraToggle';
import { PublishedMicToggle } from '../media/PublishedMicToggle';
import { ScreenShareToggle } from '../media/ScreenShareToggle';
import { CopyLinkButton } from './CopyLinkButton/CopyLinkButton';
import { LeaveMeetingButton } from './LeaveMeetingButton/LeaveMeetingButton';

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
          <Box style={{ marginLeft: 8 }}>
            <Logo width={90} beamerTrigger />
          </Box>
          <Spacing gap={0.5} alignItems="center" color="grey.900" flexDirection="row" justifyContent="center">
            <PublishedCameraToggle />
            <PublishedMicToggle />
            <Hidden xsDown>
              <ScreenShareToggle />
            </Hidden>
          </Spacing>
          <Spacing gap={0.5} alignItems="center" justifyContent="flex-end" color="grey.900" flexDirection={'row'}>
            <Hidden xsDown>
              <CopyLinkButton />
            </Hidden>
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
