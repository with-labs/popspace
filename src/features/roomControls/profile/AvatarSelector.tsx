import { avatarOptions } from '@constants/AvatarMetadata';
import { Box, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { groupBy } from 'lodash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { AvatarGrid } from './AvatarGrid';

export interface IAvatarSelectorProps {
  onChange: (avatarName: string) => void;
  value: string | null;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    overflowY: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    [theme.breakpoints.down('sm')]: {
      height: '100%',
    },
  },
  category: {
    marginBottom: '48px',
  },
  title: {
    marginBottom: theme.spacing(1),
  },
}));

const categorizedAvatars = groupBy(avatarOptions, 'category');

export const AvatarSelector: React.FC<IAvatarSelectorProps> = ({ onChange, value, className, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      flexShrink={1}
      flexBasis={'auto'}
      className={clsx(classes.wrapper, className)}
      {...props}
    >
      {Object.keys(categorizedAvatars).map((category) => {
        return (
          <div key={category} className={classes.category}>
            <AvatarGrid avatarList={categorizedAvatars[category]} onChange={onChange} value={value} />
          </div>
        );
      })}
    </Box>
  );
};
