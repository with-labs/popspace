import * as React from 'react';
import { useSelector } from 'react-redux';
import { Draggable, DraggableHandle } from '../Draggable';
import ParticipantCircle from '../../../withComponents/ParticipantCircle';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import { useLocalParticipant } from '../../../withHooks/useLocalParticipant/useLocalParticipant';
import * as Sentry from '@sentry/react';
import { makeStyles, Paper } from '@material-ui/core';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';

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
    width: 160,
    height: 160,
    borderRadius: '100%',
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

  if (!participant) {
    return null;
  }

  const isMe = localParticipant.sid === participant.sid;

  return (
    <Draggable id={props.id} zIndex={isMe ? 10 : 9}>
      <DraggableHandle disabled={!isMe}>
        <Paper className={classes.root} elevation={6}>
          <ParticipantCircle participant={participant} />
        </Paper>
      </DraggableHandle>
    </Draggable>
  );
});
