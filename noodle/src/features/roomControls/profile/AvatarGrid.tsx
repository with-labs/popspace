import { Avatar } from '@components/Avatar/Avatar';
import { useAvatarBackgroundColor } from '@components/Avatar/useAvatarBackgroundColor';
import { SkeletonList } from '@components/SkeletonList/SkeletonList';
import { avatarNames } from '@constants/AvatarMetadata';
import { ButtonBase, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

export interface IAvatarGridProps {
  onChange: (avatarName: string) => void;
  value: string | null;
  className?: string;
  loading?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(auto-fit, 120px)',
    gridAutoRows: '100px',
    gridGap: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  item: {
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    transition: theme.transitions.create(['box-shadow', 'transform']),
    width: '100%',
    height: '100%',

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
    width: '90%',
    height: 'auto',
    borderRadius: theme.shape.contentBorderRadius,
    position: 'absolute',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-50%)',
    display: 'block',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transition: theme.transitions.create(['transform']),
  },
  buttonTest: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const AvatarGrid: React.FC<IAvatarGridProps> = ({ onChange, value, className, loading }) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)}>
      {loading ? (
        <SkeletonList />
      ) : (
        avatarNames.map((avatarName) => (
          <ButtonBase
            key={avatarName}
            onClick={() => onChange(avatarName)}
            className={clsx(classes.item, avatarName === value && classes.itemSelected)}
            aria-label={`Avatar ${avatarName}`}
          >
            <AvatarPreview className={classes.imageContainer} name={avatarName} />
          </ButtonBase>
        ))
      )}
    </div>
  );
};

const AvatarPreview = ({ name, className }: { name: string; className?: string }) => {
  const backgroundColor = useAvatarBackgroundColor(name);

  return (
    <div className={className} style={{ backgroundColor: backgroundColor }}>
      <Avatar name={name} />
    </div>
  );
};
