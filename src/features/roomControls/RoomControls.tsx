import * as React from 'react';
import { RoomTaskbar } from './taskbar/RoomTaskbar';
import { ActionBar } from './addContent/ActionBar';
import { WidgetMenu } from './widgetMenu/WidgetMenu';
import { OnboardingPopup } from '@features/onboarding/OnboardingPopup';

export interface IRoomControlsProps {}

export const RoomControls = React.memo<IRoomControlsProps>(() => {
  return (
    <>
      <RoomTaskbar />
      {/* designs dont show these in them, but might want to revive these? everthing wip */}
      {/* <Spacing flexDirection="row" className={classes.roomAndViewportControls}>
        <ViewportControls />
      </Spacing> */}
      <ActionBar />
      <WidgetMenu />
      <OnboardingPopup />
    </>
  );
});
