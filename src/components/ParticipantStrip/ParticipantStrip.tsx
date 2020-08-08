/**
 * #WITH_EDIT
 *
 * Added huddle context and modified the `setSelected` handler to change huddle statuses.
 * Setting the `disableAudio` prop on remote participants based on audio blacklist (which is dervied from huddles).
 */

import React from 'react';
import Participant from '../Participant/Participant';
import { styled } from '@material-ui/core/styles';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

import useHuddleContext from '../../withHooks/useHuddleContext/useHuddleContext';

import { Participant as TPart } from 'twilio-video';
import useAudioTrackBlacklist from '../../withHooks/useAudioTrackBlacklist/useAudioTrackBlacklist';

const Container = styled('aside')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: `calc(100% - ${theme.sidebarWidth}px)`,
  left: 0,
  padding: '0.5em',
  overflowY: 'auto',
}));

export default function ParticipantStrip() {
  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  const disabledAudioSids = useAudioTrackBlacklist();

  const { huddles, inviteToHuddle, removeFromHuddle, leaveHuddle } = useHuddleContext();

  const setSelected = (participant: TPart) => {
    // TODO this is more for some testing stuff right now.
    if (participant.sid === localParticipant.sid) {
      // It's me! So leave whatever convo I'm in.
      leaveHuddle();
    } else if (
      huddles[participant.sid] &&
      huddles[localParticipant.sid] &&
      huddles[participant.sid] === huddles[localParticipant.sid]
    ) {
      // It's somebody else and we are in the same convo, so remove them
      removeFromHuddle(huddles[participant.sid], participant.sid);
    } else {
      // Otherwise, invite them
      inviteToHuddle(participant.sid);
    }

    setSelectedParticipant(participant);
  };

  return (
    <Container>
      <Participant
        participant={localParticipant}
        isSelected={selectedParticipant === localParticipant}
        onClick={() => setSelected(localParticipant)}
      />
      {participants.map(participant => (
        <Participant
          key={participant.sid}
          participant={participant}
          isSelected={selectedParticipant === participant}
          onClick={() => setSelected(participant)}
          disableAudio={disabledAudioSids.includes(participant.sid)}
        />
      ))}
    </Container>
  );
}
