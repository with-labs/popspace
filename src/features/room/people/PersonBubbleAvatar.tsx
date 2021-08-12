import { AvatarAnimationState } from '@components/Avatar/AvatarAnimator';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

import { IPersonAvatarProps, PersonAvatar } from './PersonAvatar';

export interface IPersonBubbleAvatarProps extends Omit<IPersonAvatarProps, 'personId'> {
  children?: React.ReactNode;
  userId: string;
  grayscale?: boolean;
  avatarName?: string;
  isSpeaking: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 40,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    transition: theme.transitions.create('filter'),
    filter: 'grayscale(0)',
  },
  grayscale: {
    filter: 'grayscale(1)',
  },
}));

export const PersonBubbleAvatar: React.FC<IPersonBubbleAvatarProps> = ({
  userId,
  grayscale,
  className,
  avatarName,
  isSpeaking: isTalking,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <PersonAvatar
      className={clsx(classes.root, grayscale && classes.grayscale, className)}
      personId={userId}
      avatarName={avatarName}
      animation={isTalking ? AvatarAnimationState.Talking : AvatarAnimationState.Idle}
      {...rest}
    />
  );
};
