import * as React from 'react';
import { MicToggle } from './MicToggle';
import { logger } from '@utils/logger';
import { useRemoteControl } from '@hooks/useRemoteControl/useRemoteControl';
import { MIC_TRACK_NAME } from '@constants/User';
import { useRoomStore } from '@api/useRoomStore';
import { useMicControl } from '@src/media/hooks';

export interface IPublishedMicToggleProps {
  showMicsList?: boolean;
  className?: string;
  useSmall?: boolean;
  displayToolTip?: boolean;
}

export const PublishedMicToggle: React.FC<IPublishedMicToggleProps> = ({
  showMicsList = true,
  className,
  useSmall = false,
  displayToolTip,
}) => {
  const { isPublishing, toggle, track } = useMicControl();
  const { muteSession } = useRemoteControl();

  const handleMicOn = () => {
    // the action of turning the microphone on makes this the primary
    // session - mute all other sessions.
    const roomState = useRoomStore.getState();
    const currentSessionId = roomState.sessionId;
    if (!currentSessionId) {
      // this shouldn't really happen
      logger.error(`Mic was turned on, but there's no active session`);
    } else {
      const currentUserId = roomState.sessionLookup[currentSessionId];
      const allSessionIds = roomState.users[currentUserId].sessionIds;
      allSessionIds.forEach((id) => muteSession(id, MIC_TRACK_NAME));
    }
  };

  return (
    <MicToggle
      isMicOn={!!track}
      doMicToggle={toggle}
      busy={isPublishing}
      handleMicOn={handleMicOn}
      showMicsList={showMicsList}
      className={className}
      useSmall={useSmall}
      displayToolTip={displayToolTip}
    />
  );
};
