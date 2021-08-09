import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box, makeStyles } from '@material-ui/core';
import TimeAgo from 'react-timeago';

export interface IMessageProps {
  name: string;
  timestamp: string;
  message: string;
}

const useStyles = makeStyles((theme) => ({
  info: {
    color: theme.palette.brandColors.slate.ink,
  },
}));

export const Message: React.FC<IMessageProps> = ({ name, timestamp, message }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box>
      <Box className={classes.info}>
        <Typography variant="body2">
          {name} - <TimeAgo date="Aug 29, 2014" />
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Box>
  );
};
