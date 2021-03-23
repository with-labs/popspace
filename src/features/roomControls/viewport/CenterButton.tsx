import { IconButton } from '@material-ui/core';
import * as React from 'react';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useRoomViewport } from '../../room/RoomViewport';
import { CrosshairIcon } from '../../../components/icons/CrosshairIcon';
import { SPRINGS } from '../../../constants/springs';

export interface ICenterButtonProps {
  className?: string;
}

export const CenterButton: React.FC<ICenterButtonProps> = (props) => {
  const viewport = useRoomViewport();
  const userPosition = useRoomStore(
    React.useCallback((store) => {
      if (!store.sessionId) return { x: 0, y: 0 };
      const userId = store.sessionLookup[store.sessionId];
      return store.userPositions[userId]?.position || { x: 0, y: 0 };
    }, [])
  );

  const centerOnUser = () => {
    viewport.panAbsolute(userPosition, SPRINGS.RELAXED);
  };

  return (
    <IconButton onClick={centerOnUser} {...props}>
      <CrosshairIcon />
    </IconButton>
  );
};
