import { Box } from '@material-ui/core';
import * as React from 'react';
import { ActionIcon } from '@components/icons/ActionIcon';
import { SquareIconButton } from '@components/SquareIconButton/SquareIconButton';
import { useRoomModalStore } from '../useRoomModalStore';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';

export type ActionBarButtonProps = {
  className?: string;
};

export const ActionBarButton = React.forwardRef<HTMLButtonElement, ActionBarButtonProps>(
  ({ className, ...rest }, ref) => {
    const openModal = useRoomModalStore((store) => store.api.openModal);
    const onClick = () => {
      Analytics.trackEvent(EventNames.QUICK_ACTION_BUTTON_PRESSED);
      openModal('actionBar');
    };

    return (
      <SquareIconButton {...rest} onClick={onClick} ref={ref}>
        <Box
          borderRadius={4}
          bgcolor="grey.100"
          fontSize={20}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width={32}
          height={32}
          p={0.25}
        >
          <ActionIcon color="inherit" fontSize="inherit" />
        </Box>
      </SquareIconButton>
    );
  }
);
