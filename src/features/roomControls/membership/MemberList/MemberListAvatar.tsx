import React from 'react';
import { Avatar } from '../../../../components/Avatar/Avatar';
import { useAvatar } from '../../../../hooks/useAvatar/useAvatar';
import { makeStyles, useTheme } from '@material-ui/core';

import { ReactComponent as BgFillGlyph } from '../images/background_fill.svg';

const INVITED_AVATAR_URL = 'https://s3.us-east-2.amazonaws.com/with.static/invited.png';
interface IMemberListAvatarProps {
  avatarName: string;
  hasAccepted: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    width: 40,
    height: 34,
  },
  bgFiller: {
    width: 40,
    height: 34,
  },
  avatar: {
    width: '100%',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 0,
  },
}));

export const MemberListAvatar: React.FC<IMemberListAvatarProps> = ({ avatarName, hasAccepted }) => {
  const classes = useStyles();
  const theme = useTheme();
  const displayAvatar = hasAccepted ? avatarName ?? 'blobby' : INVITED_AVATAR_URL;
  const { backgroundColor } = useAvatar(displayAvatar) ?? { backgroundColor: theme.palette.grey[50] };

  return (
    <div className={classes.root}>
      <div style={{ color: backgroundColor }}>
        <BgFillGlyph className={classes.bgFiller} />
      </div>
      <Avatar className={classes.avatar} name={displayAvatar} useFallback={true} />
    </div>
  );
};
