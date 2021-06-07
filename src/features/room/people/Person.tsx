import * as React from 'react';
import { PersonBubble } from './PersonBubble';
import { useRoomStore } from '@roomState/useRoomStore';
import { useCurrentUserProfile } from '@hooks/api/useCurrentUserProfile';
import { useSoundEffects } from '@components/SoundEffectProvider/useSoundEffects';
import { CanvasObject } from '@providers/canvas/CanvasObject';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import { makeStyles } from '@material-ui/core';
import { usePersonStreams } from './usePersonStreams';

const MAX_Z_INDEX = 2147483647;
export interface IPersonProps {
  personId: string;
}

const useStyles = makeStyles(() => ({
  dragHandle: {
    width: '100%',
    height: '100%',
  },
}));

export const Person = React.memo<IPersonProps>(({ personId }) => {
  const classes = useStyles();

  const person = useRoomStore(React.useCallback((room) => room.users[personId], [personId]));
  const isMe = personId === useCurrentUserProfile().user?.id;

  const { mainStream, secondaryStreams: sidecarStreams } = usePersonStreams(personId);

  // play a sound when any other person first enters the room
  const { playSound } = useSoundEffects();
  React.useEffect(() => {
    if (person && !isMe) {
      playSound('join');
    }
  }, [person, isMe, playSound]);

  if (!person) {
    return null;
  }

  return (
    <CanvasObject
      objectId={personId}
      zIndex={isMe ? MAX_Z_INDEX : MAX_Z_INDEX - 1}
      objectKind="person"
      origin="center"
      preserveAspect
    >
      <CanvasObjectDragHandle disabled={!isMe} className={classes.dragHandle}>
        <PersonBubble person={person} isMe={isMe} mainStream={mainStream} sidecarStreams={sidecarStreams} />
      </CanvasObjectDragHandle>
    </CanvasObject>
  );
});
