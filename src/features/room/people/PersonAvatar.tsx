import * as React from 'react';
import { Avatar, IAvatarProps } from '../../../components/Avatar/Avatar';
import { useRoomStore } from '../../../roomState/useRoomStore';

export interface IPersonAvatarProps extends Omit<IAvatarProps, 'name' | 'useFallback'> {
  personId: string;
  className?: string;
}

/** Shows the avatar for a person based on their ID */
export const PersonAvatar = React.memo<IPersonAvatarProps>(({ personId, ...rest }) => {
  const avatar = useRoomStore((room) => room.users[personId]?.participantState.avatarName ?? 'blobby');

  return avatar ? <Avatar name={avatar} {...rest} /> : null;
});
