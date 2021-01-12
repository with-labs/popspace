import * as React from 'react';
import { makeStyles, ButtonBase } from '@material-ui/core';
import { IAvatar } from '../../../utils/AvatarOptions';
import clsx from 'clsx';
export interface IAvatarGridProps {
  onChange: (avatarName: string) => void;
  value: string | null;
  avatarList: IAvatar[];
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridAutoRows: '1fr',
    gridGap: theme.spacing(2),
    padding: theme.spacing(0.5),

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  item: {
    borderRadius: theme.shape.contentBorderRadius,
    overflow: 'hidden',
    transition: theme.transitions.create(['box-shadow', 'transform']),

    '&:focus:not($itemSelected), &:hover:not($itemSelected)': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[500]}`,
      '& > $imageContainer': {
        transform: `scale(0.9)`,
      },
    },
    '&:active': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[900]}`,
      '& > $imageContainer': {
        transform: `scale(1)`,
      },
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
    transition: theme.transitions.create(['transform']),
  },
  imageBackground: {
    width: '100%',
    height: '75%',
    position: 'absolute',
    bottom: 0,
    borderRadius: theme.shape.contentBorderRadius,
  },
  buttonTest: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const AvatarGrid: React.FC<IAvatarGridProps> = ({ onChange, value, avatarList }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {avatarList.map((avatar) => (
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
