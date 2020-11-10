import * as React from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from '../Draggable';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import * as Sentry from '@sentry/react';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';
import { PersonBubble } from './PersonBubble';
import { useNamedTrack } from '../../../hooks/useNamedTrack/useNamedTrack';
import { MIC_TRACK_NAME, CAMERA_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '../../../constants/User';

const MAX_Z_INDEX = 2147483647;

export interface IPersonProps {
  id: string;
}

function useParticipant(sid: string) {
  const remoteParticipants = useParticipants();
  const localParticipant = useLocalParticipant();

  const all = [localParticipant, ...remoteParticipants];
  return all.find((p) => p?.sid === sid) ?? null;
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

  const audioTrackPub = useNamedTrack(participant, MIC_TRACK_NAME);
  const cameraTrackPub = useNamedTrack(participant, CAMERA_TRACK_NAME);
  const screenShareVideoTrackPub = useNamedTrack(participant, SCREEN_SHARE_TRACK_NAME);

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
