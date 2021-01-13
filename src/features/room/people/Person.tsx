import * as React from 'react';
import { Draggable } from '../Draggable';
import { PersonBubble } from './PersonBubble';
import { useRoomStore } from '../../../roomState/useRoomStore';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { Stream } from '../../../types/streams';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { useCollectedStreams } from '../../../hooks/useCollectedStreams/useCollectedStreams';

const MAX_Z_INDEX = 2147483647;

export interface IPersonProps {
  personId: string;
}

export const Person = React.memo<IPersonProps>(({ personId }) => {
  const person = useRoomStore(React.useCallback((room) => room.users[personId], [personId]));

  // FIXME: this is essentially random right now!
  // it may not even be consistent across different peers!
  // We're selecting a Twilio participant, of all the participants which may
  // be associated with the User, to show as the "primary" one
  const { allParticipants } = useVideoContext();
  const allAssociatedParticipants = React.useMemo(
    // sorting to at least make it stable
    () =>
      allParticipants
        .sort((a, b) => a.identity.localeCompare(b.identity))
        .filter((p) => p.identity.startsWith(`${personId}#`)),
    [allParticipants, personId]
  );

  const isMe = personId === useCurrentUserProfile().user?.id;

  const groupedStreams = useCollectedStreams(allAssociatedParticipants);
  const allStreams = React.useMemo(() => {
    return Object.values(groupedStreams)
      .reduce<Array<Stream>>((streamList, streamGroup) => {
        if (streamGroup.av) streamList.push(streamGroup.av);
        if (streamGroup.screen) streamList.push(streamGroup.screen);
        return streamList;
      }, [])
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [groupedStreams]);
  // only one stream should have audio on - that is the first choice for main stream.
  // if no streams have audio, choose the first in the sorted list with video. Otherwise,
  // just choose the first one.
  const mainStream =
    allStreams.find((stream) => !!stream.audioPublication) ??
    allStreams.find((stream) => !!stream.videoPublication) ??
    null;
  const sidecarStreams = allStreams.filter((s) => s !== mainStream);

  if (!person) {
    return null;
  }

  return (
    <Draggable id={personId} zIndex={isMe ? MAX_Z_INDEX : MAX_Z_INDEX - 1} kind="person">
      <PersonBubble person={person} isMe={isMe} mainStream={mainStream} sidecarStreams={sidecarStreams} />
    </Draggable>
  );
});
