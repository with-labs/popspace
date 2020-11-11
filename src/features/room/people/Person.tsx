import * as React from 'react';
import { Draggable } from '../Draggable';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import { PersonBubble } from './PersonBubble';
import { useNamedPublication } from '../../../hooks/useNamedPublication/useNamedPublication';
import { MIC_TRACK_NAME, CAMERA_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '../../../constants/User';
import { LocalParticipant, RemoteParticipant } from 'twilio-video';
import { useEnforcedPersonSelector } from './useEnforcedPersonSelector';

const MAX_Z_INDEX = 2147483647;

export interface IPersonProps {
  participant: LocalParticipant | RemoteParticipant;
}

export const Person = React.memo<IPersonProps>(({ participant }) => {
  const localParticipant = useLocalParticipant();
  const person = useEnforcedPersonSelector(participant.sid);

  const isMe = localParticipant?.sid === participant?.sid;

  const audioTrackPub = useNamedPublication(participant, MIC_TRACK_NAME);
  const cameraTrackPub = useNamedPublication(participant, CAMERA_TRACK_NAME);
  const screenShareVideoTrackPub = useNamedPublication(participant, SCREEN_SHARE_TRACK_NAME);

  if (!participant || !person) {
    return null;
  }

  return (
    <Draggable id={props.id} zIndex={isMe ? MAX_Z_INDEX : MAX_Z_INDEX - 1}>
      <PersonBubble
        participant={participant}
        person={person}
        isLocal={isMe}
        audioTrack={audioTrackPub}
        cameraTrack={cameraTrackPub}
        screenShareTrack={screenShareVideoTrackPub}
      />
    </Draggable>
  );
});
