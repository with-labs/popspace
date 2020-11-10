import * as React from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from '../Draggable';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import * as Sentry from '@sentry/react';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';
import { PersonBubble } from './PersonBubble';
import { useNamedPublication } from '../../../hooks/useNamedPublication/useNamedPublication';
import { MIC_TRACK_NAME, CAMERA_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '../../../constants/User';
import { useParticipant } from '../../../hooks/useParticipant/useParticipant';

const MAX_Z_INDEX = 2147483647;

export interface IPersonProps {
  id: string;
}

export const Person = React.memo<IPersonProps>((props) => {
  const localParticipant = useLocalParticipant();

  // constructing a memoized selector for a person by ID
  const personSelector = React.useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.people,
        (_: any, personId: string) => personId,
        (people, personId) => people[personId] ?? null
      ),
    []
  );
  const person = useSelector((state: RootState) => personSelector(state, props.id));

  // find the person's media "participant" data
  const participant = useParticipant(person.id);

  React.useEffect(() => {
    if (person.id && !participant) {
      Sentry.captureMessage(
        `Error displaying person with SID ${person.id}: no media participant found`,
        Sentry.Severity.Debug
      );
    }
  }, [participant, person.id]);

  const isMe = localParticipant?.sid === participant?.sid;

  const audioTrackPub = useNamedPublication(participant, MIC_TRACK_NAME);
  const cameraTrackPub = useNamedPublication(participant, CAMERA_TRACK_NAME);
  const screenShareVideoTrackPub = useNamedPublication(participant, SCREEN_SHARE_TRACK_NAME);

  if (!participant) {
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
