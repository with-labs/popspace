import * as React from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../roomSlice';
import { Avatar } from '../../../withComponents/Avatar/Avatar';

export interface IPersonAvatarProps {
  personId: string;
  className?: string;
}

/** Shows the avatar for a person based on their ID */
export const PersonAvatar: React.FC<IPersonAvatarProps> = (props) => {
  const avatar = useSelector(selectors.createPersonAvatarSelector(props.personId));

  return avatar ? <Avatar name={avatar} className={props.className} /> : null;
};
