import * as React from 'react';
import { Draggable } from '../Draggable';
import { PersonBubble } from './PersonBubble';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { Stream } from '../../../types/streams';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { useCollectedStreams } from '../../../hooks/useCollectedStreams/useCollectedStreams';
import { useSoundEffects } from '../../../components/SoundEffectProvider/useSoundEffects';
import { useTwilio } from '../../../providers/twilio/TwilioProvider';

const MAX_Z_INDEX = 2147483647;
const CENTER_ORIGIN = { horizontal: 0.5, vertical: 0.5 };

export interface IPersonProps {
  personId: string;
}

export const Person = React.memo<IPersonProps>(({ personId }) => {
  const person = useRoomStore(React.useCallback((room) => room.users[personId], [personId]));

  const { allParticipants } = useTwilio();
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
  // just choose the first one. Only AV streams are considered - we don't want the
  // bubble to be a screenshare!
  const mainStream =
    allStreams.find((stream) => stream.kind === 'av' && !!stream.audioPublication) ??
    allStreams.find((stream) => stream.kind === 'av' && !!stream.videoPublication) ??
    null;
  const sidecarStreams = allStreams.filter((s) => s !== mainStream);

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
    <Draggable id={personId} zIndex={isMe ? MAX_Z_INDEX : MAX_Z_INDEX - 1} kind="person" origin={CENTER_ORIGIN}>
      <PersonBubble person={person} isMe={isMe} mainStream={mainStream} sidecarStreams={sidecarStreams} />
    </Draggable>
  );
});
