import * as React from 'react';
import { makeStyles, Typography, Box } from '@material-ui/core';
import { options as avatarOptions } from '../../../utils/AvatarOptions';
import { AvatarGrid } from './AvatarGrid';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash';

export interface IAvatarSelectorProps {
  onChange: (avatarName: string) => void;
  value: string | null;
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    overflowY: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    height: 340,
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

export const AvatarSelector: React.FC<IAvatarSelectorProps> = ({ onChange, value }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      flexShrink={1}
      flexBasis={'auto'}
      className={classes.wrapper}
    >
      {Object.keys(categorizedAvatars).map((category) => {
        return (
          <div key={category} className={classes.category}>
            <Typography variant="h3" className={classes.title}>
              {t(`modals.userSettingsModal.category.${category}`)}
            </Typography>
            <AvatarGrid avatarList={categorizedAvatars[category]} onChange={onChange} value={value} />
          </div>
        );
      })}
    </Box>
  );
};
