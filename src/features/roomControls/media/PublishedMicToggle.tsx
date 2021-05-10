import * as React from 'react';
import { MicToggle } from './MicToggle';
import { logger } from '../../../utils/logger';
import { useRemoteControl } from '../../../hooks/useRemoteControl/useRemoteControl';
import { MIC_TRACK_NAME } from '../../../constants/User';
import { useRoomStore } from '../../../roomState/useRoomStore';
import usePublishedAudioToggle from '../../../providers/media/hooks/usePublishedAudioToggle';
import { useRoomStatus } from '../../../providers/twilio/hooks/useRoomStatus';
import { TwilioStatus } from '../../../providers/twilio/TwilioProvider';

export const PublishedMicToggle = () => {
  const [isMicOn, doMicToggle, isAudioBusy] = usePublishedAudioToggle();
  const roomStatus = useRoomStatus();
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
      isMicOn={isMicOn}
      doMicToggle={doMicToggle}
      busy={isAudioBusy || roomStatus !== TwilioStatus.Connected}
      handleMicOn={handleMicOn}
    />
  );
};
