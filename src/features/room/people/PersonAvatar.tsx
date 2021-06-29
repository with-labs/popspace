import * as React from 'react';
import { Avatar, IAvatarProps } from '@components/Avatar/Avatar';
import { useRoomStore } from '@api/useRoomStore';
import { getAvatarFromUserId } from '@constants/AvatarMetadata';

export interface IPersonAvatarProps extends Omit<IAvatarProps, 'name' | 'useFallback'> {
  personId: string;
  className?: string;
  avatarName?: string;
}

/** Shows the avatar for a person based on their ID */
export const PersonAvatar = React.memo<IPersonAvatarProps>(({ personId, avatarName, ...rest }) => {
  const avatar = useRoomStore((room) => {
    let ret = getAvatarFromUserId('brandedPatterns', personId);
    if (room.users[personId]?.actor.avatarName) {
      ret = room.users[personId]?.actor.avatarName;
    } else if (avatarName) {
      ret = avatarName;
    }

    return ret;
  });

  return avatar ? <Avatar name={avatar} {...rest} /> : null;
});
