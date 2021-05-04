import { IconButton } from '@material-ui/core';
import * as React from 'react';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { CrosshairIcon } from '../../../components/icons/CrosshairIcon';
import { useViewport } from '../../../providers/viewport/useViewport';

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
