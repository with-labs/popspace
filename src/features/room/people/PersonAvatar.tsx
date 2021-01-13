import * as React from 'react';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useRoomStore } from '../../../roomState/useRoomStore';

export interface IPersonAvatarProps {
  personId: string;
  className?: string;
}

/** Shows the avatar for a person based on their ID */
export const PersonAvatar = React.memo<IPersonAvatarProps>((props) => {
  const avatar = useRoomStore((room) => room.users[props.personId]?.participantState.avatarName ?? 'blobby');

  return avatar ? <Avatar name={avatar} className={props.className} /> : null;
});
