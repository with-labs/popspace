import * as React from 'react';
import { RoomTaskbar } from './taskbar/RoomTaskbar';
import { ActionBar } from './addContent/ActionBar';
import { WidgetMenu } from './widgetMenu/WidgetMenu';
import { OnboardingPopup } from '@features/onboarding/OnboardingPopup';
import { Spacing } from '@components/Spacing/Spacing';
import { Box, Paper, useTheme } from '@material-ui/core';
import { CenterButton } from './viewport/CenterButton';
import { ZoomInButton } from './viewport/ZoomInButton';
import { ZoomOutButton } from './viewport/ZoomOutButton';

export interface IRoomControlsProps {}

export const RoomControls = React.memo<IRoomControlsProps>(() => {
  const theme = useTheme();

  return (
    <>
      <RoomTaskbar />
      <Spacing
        gap={0.5}
        flexDirection="column"
        position="fixed"
        zIndex={theme.zIndex.speedDial}
        right={theme.spacing(3)}
        bottom={theme.spacing(3)}
      >
        <Box component={Paper} padding={0.25}>
          <CenterButton />
        </Box>
        <Spacing component={Paper} padding={0.25} gap={0.25} flexDirection="column">
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
