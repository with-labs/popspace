import * as React from 'react';
import { makeStyles, ButtonBase } from '@material-ui/core';
import { options as avatarOptions } from '../../../utils/AvatarOptions';
import clsx from 'clsx';

export interface IAvatarGridProps {
  onChange: (avatarName: string) => void;
  value: string | null;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: '1fr',
    gridGap: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  item: {
    borderRadius: theme.shape.contentBorderRadius,
    overflow: 'hidden',

    transition: theme.transitions.create(['box-shadow', 'padding']),

    '&:focus:not($itemSelected), &:hover:not($itemSelected)': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[500]}`,
      padding: 4,
    },
    '&:active': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[900]}`,
      padding: 4,
    },
  },
  itemSelected: {
    boxShadow: `0 0 0 4px ${theme.palette.secondary.dark}`,
    padding: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.contentBorderRadius,
    position: 'relative',
    display: 'block',
  },
  imageContainer: {
    position: 'relative',
  },
  imageBackground: {
    width: '100%',
    height: '75%',
    position: 'absolute',
    bottom: 0,
    borderRadius: theme.shape.contentBorderRadius,
  },
}));

export const AvatarGrid: React.FC<IAvatarGridProps> = ({ onChange, value }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {avatarOptions.map((avatar) => (
        <ButtonBase
          key={avatar.name}
          onClick={() => onChange(avatar.name)}
          className={clsx(classes.item, avatar.name === value && classes.itemSelected)}
          aria-label={`Avatar ${avatar.name}`}
        >
          <div className={classes.imageContainer}>
            <div className={classes.imageBackground} style={{ backgroundColor: avatar.backgroundColor }} />
            <img className={classes.image} src={avatar.image} alt={`Avatar ${avatar.name}`} />
          </div>
        </ButtonBase>
      ))}
    </div>
  );
};
