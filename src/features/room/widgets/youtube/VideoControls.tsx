import * as React from 'react';
import { makeStyles, Tooltip, Box, IconButton, Slider } from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';
import clsx from 'clsx';

export enum PlayState {
  Playing,
  Paused,
}

export interface IVideoControlsProps {
  onSeek: (timestamp: number, stillSeeking: boolean) => any;
  /** in seconds */
  timestamp: number;
  onPlayStateChanged: (playState: PlayState, timestamp: number) => any;
  playState: PlayState;
  className?: string;
  duration: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  },
  slider: {
    flex: 1,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
}));

export const VideoControls: React.FC<IVideoControlsProps> = ({
  timestamp,
  playState,
  onSeek,
  onPlayStateChanged,
  className,
  duration,
}) => {
  const classes = useStyles();

  const togglePlayState = () => {
    if (playState === PlayState.Paused) {
      onPlayStateChanged(PlayState.Playing, timestamp);
    } else {
      onPlayStateChanged(PlayState.Paused, timestamp);
    }
  };

  const handleScrub = React.useCallback(
    (ev: any, newValue: number | number[]) => {
      ev.preventDefault();
      ev.stopPropagation();
      onSeek(newValue as number, true);
    },
    [onSeek]
  );

  const handleSeek = React.useCallback(
    (ev: any, newValue: number | number[]) => {
      ev.preventDefault();
      ev.stopPropagation();
      onSeek(newValue as number, false);
    },
    [onSeek]
  );

  return (
    <Box display="flex" flexDirection="row" alignItems="center" p={1} className={clsx(classes.root, className)}>
      <IconButton onClick={togglePlayState} size="small" color="inherit">
        {playState === PlayState.Playing ? <Pause /> : <PlayArrow />}
      </IconButton>
      <Slider
        ValueLabelComponent={TimestampLabel}
        aria-label="Video timestamp"
        value={timestamp}
        onChange={handleScrub}
        onChangeCommitted={handleSeek}
        className={classes.slider}
        max={duration}
      />
    </Box>
  );
};

function toTimestampString(time: number) {
  const hours = Math.floor(time / (60 * 60));
  const minutes = Math.floor((time - hours * 60 * 60) / 60);
  const seconds = `${Math.floor(time - hours * 60 * 60 - minutes * 60)}`.padStart(2, '0');
  return `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds}`;
}

const TimestampLabel: React.FC<{ open: boolean; value: number; children: React.ReactElement }> = ({
  open,
  value,
  children,
}) => {
  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={toTimestampString(value)}>
      {children}
    </Tooltip>
  );
};
