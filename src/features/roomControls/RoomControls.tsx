import * as React from 'react';
import { RoomTaskbar } from './taskbar/RoomTaskbar';
import { ActionBar } from './addContent/ActionBar';
import { WidgetMenu } from './widgetMenu/WidgetMenu';
import { OnboardingPopup } from '@features/onboarding/OnboardingPopup';

import { Spacing } from '@components/Spacing/Spacing';
import { Box, makeStyles, Paper } from '@material-ui/core';
import { CenterButton } from './viewport/CenterButton';
import { ZoomInButton } from './viewport/ZoomInButton';
import { ZoomOutButton } from './viewport/ZoomOutButton';

import { isMobileOnly } from 'react-device-detect';

export interface IRoomControlsProps {}

const useStyles = makeStyles((theme) => ({
  viewportControls: {
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    zIndex: theme.zIndex.speedDial,
    position: 'fixed',
    '@media(max-width: 600px)': {
      bottom: 88,
    },
  },
  zoomButtons: {
    '@media(max-width: 600px)': {
      display: 'none',
    },
  },
}));

export const RoomControls = React.memo<IRoomControlsProps>(() => {
  const styles = useStyles();

  return isMobileOnly ? (
    <>
      <Spacing gap={1} flexDirection="column" className={styles.viewportControls}>
        <Box component={Paper} padding={0.25}>
          <CenterButton />
        </Box>
        <Spacing component={Paper} padding={0.25} gap={0.25} flexDirection="column" className={styles.zoomButtons}>
          <ZoomInButton />
          <ZoomOutButton />
        </Spacing>
      </Spacing>
      <Box position="absolute" bottom="0" width="100%">
        <RoomTaskbar />
      </Box>
    </>
  ) : (
    <>
      <RoomTaskbar />
      <Spacing gap={1} flexDirection="column" className={styles.viewportControls}>
        <Box component={Paper} padding={0.25}>
          <CenterButton />
        </Box>
        <Spacing component={Paper} padding={0.25} gap={0.25} flexDirection="column" className={styles.zoomButtons}>
          <ZoomInButton />
          <ZoomOutButton />
        </Spacing>
      </Spacing>
      <ActionBar />
      <WidgetMenu />
      <OnboardingPopup />
    </>
  );
});
