import { IconButton } from '@material-ui/core';
import * as React from 'react';
import { useRoomStore } from '@api/useRoomStore';
import { CrosshairIcon } from '@components/icons/CrosshairIcon';
import { useViewport } from '@providers/viewport/useViewport';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';
export interface ICenterButtonProps {
  className?: string;
}

export const CenterButton: React.FC<ICenterButtonProps> = (props) => {
  const viewport = useViewport();
  const userPosition = useRoomStore(
    React.useCallback((store) => {
      if (!store.sessionId) return { x: 0, y: 0 };
      const userId = store.sessionLookup[store.sessionId];
      return store.userPositions[userId]?.position || { x: 0, y: 0 };
    }, [])
  );

  const centerOnUser = () => {
    Analytics.trackEvent(EventNames.BUTTON_CLICKED, 'center_on_user');
    viewport.doPan(userPosition, {
      origin: 'control',
    });
  };

  return (
    <IconButton onClick={centerOnUser} {...props}>
      <CrosshairIcon />
    </IconButton>
  );
};
