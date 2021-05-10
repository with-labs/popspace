import * as React from 'react';
import { Avatar, IAvatarProps } from '../../../components/Avatar/Avatar';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { randomSectionAvatar } from '../../../constants/AvatarMetadata';

export interface IPersonAvatarProps extends Omit<IAvatarProps, 'name' | 'useFallback'> {
  personId: string;
  className?: string;
  avatarName?: string;
}

/** Shows the avatar for a person based on their ID */
export const PersonAvatar = React.memo<IPersonAvatarProps>(({ personId, avatarName, ...rest }) => {
  const avatar = useRoomStore((room) => {
    let ret = randomSectionAvatar('brandedPatterns');
    if (room.users[personId]?.participantState.avatarName) {
      ret = room.users[personId]?.participantState.avatarName;
    } else if (avatarName) {
      ret = avatarName;
    }

    return ret;
  });

  return avatar ? <Avatar name={avatar} {...rest} /> : null;
});
