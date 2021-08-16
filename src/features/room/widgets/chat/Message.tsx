import * as React from 'react';
import { Typography, Box, makeStyles } from '@material-ui/core';
import TimeAgo from 'react-timeago';
import { Markdown } from '@components/Markdown/Markdown';
import i18n from '@src/i18n';

export interface IMessageProps {
  name: string;
  timestamp: string;
  message: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    borderTop: `1px solid ${theme.palette.brandColors.slate.light}`,
    paddingTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  info: {
    color: theme.palette.brandColors.slate.ink,
  },
}));

function timeFormatter(
  value: number,
  unit: TimeAgo.Unit,
  suffix: TimeAgo.Suffix,
  epochMilliseconds: number,
  nextFormatter: TimeAgo.Formatter
) {
  if (unit === 'second') return i18n.t('widgets.chat.justNow');
  return nextFormatter(value, unit, suffix, epochMilliseconds);
}

export const Message: React.FC<IMessageProps> = ({ name, timestamp, message }) => {
  const classes = useStyles();

  const localTimestamp = new Date(timestamp);
  return (
    <Box className={classes.root}>
      <Box className={classes.info}>
        <Typography variant="h4">
          {name} - <TimeAgo date={localTimestamp} minPeriod={60} formatter={timeFormatter as TimeAgo.Formatter} />
        </Typography>
      </Box>
      <Box mt={1} mb={1}>
        <Markdown>{message}</Markdown>
      </Box>
    </Box>
  );
};
