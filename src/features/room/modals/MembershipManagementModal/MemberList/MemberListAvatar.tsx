import React from 'react';
import { Avatar } from '../../../../../components/Avatar/Avatar';
import { useAvatar } from '../../../../../hooks/useAvatar/useAvatar';
import { makeStyles, useTheme } from '@material-ui/core';

interface IMemberListAvatarProps {
  avatarName: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: `4px solid ${theme.palette.background.paper}`,
    transition: theme.transitions.create('border-color'),
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.mainShadows.surface,
    borderRadius: '100%',
    width: 40,
    height: 40,
  },
  avatar: {
    width: '100%',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 10,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  mainContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '100%',
  },
  background: {
    width: '100%',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    height: 30,
  },
  bottomSection: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 5,
  },
}));

export const MemberListAvatar: React.FC<IMemberListAvatarProps> = ({ avatarName }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { backgroundColor } = useAvatar(avatarName) ?? { backgroundColor: theme.palette.grey[50] };

  return (
    <div className={classes.root}>
      <div className={classes.mainContent}>
        <div className={classes.background} style={{ backgroundColor }} />
        <Avatar className={classes.avatar} name={avatarName} />
        <div className={classes.bottomSection} />
      </div>
    </div>
  );
};
