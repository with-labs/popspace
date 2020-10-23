import * as React from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from '../Draggable';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import { useLocalParticipant } from '../../../withHooks/useLocalParticipant/useLocalParticipant';
import * as Sentry from '@sentry/react';
import { makeStyles } from '@material-ui/core';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';
import { DraggableHandle } from '../DraggableHandle';
import { PersonBubble } from './PersonBubble';
import usePublications from '../../../hooks/usePublications/usePublications';
import { VideoTrackPublication, AudioTrackPublication } from 'twilio-video';

export interface IPersonProps {
  id: string;
}

function useParticipant(sid: string) {
  const remoteParticipants = useParticipants();
  const localParticipant = useLocalParticipant();

  const all = [localParticipant, ...remoteParticipants];
  return all.find((p) => p.sid === sid);
}

const useStyles = makeStyles({
  root: {
    border: 'none',
  },
  dragHandle: {
    width: '100%',
    height: '100%',
  },
});

export const Person = React.memo<IPersonProps>((props) => {
  const localParticipant = useLocalParticipant();

  const classes = useStyles();

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
        Sentry.Severity.Error
      );
    }
  }, [participant, person.id]);

  // a list of multimedia tracks this user has shared with peers
  const publications = usePublications(participant);

  if (!participant) {
    return null;
  }

  const isMe = localParticipant.sid === participant.sid;

  // extract audio and/or video publications
  const audioTrackPub = publications.find((pub) => pub.kind === 'audio') as AudioTrackPublication | undefined;
  const cameraTrackPub = publications.find((pub) => pub.kind === 'video' && pub.trackName.includes('camera')) as
    | VideoTrackPublication
    | undefined;
  const screenShareTrackPub = publications.find((pub) => pub.kind === 'video' && pub.trackName.includes('screen')) as
    | VideoTrackPublication
    | undefined;

  return (
    <Draggable id={props.id} zIndex={isMe ? 10 : 9} minHeight={140} minWidth={140}>
      <DraggableHandle disabled={!isMe} className={classes.dragHandle}>
        <PersonBubble
          participant={participant}
          person={person}
          isLocal={isMe}
          audioTrack={audioTrackPub}
          cameraTrack={cameraTrackPub}
          screenShareTrack={screenShareTrackPub}
        />
      </DraggableHandle>
    </Draggable>
  );
});
