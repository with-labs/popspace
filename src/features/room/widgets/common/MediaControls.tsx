import { WidgetMediaState } from '@api/roomState/types/widgets';
import { LoopIcon } from '@components/icons/LoopIcon';
import { PauseIcon } from '@components/icons/PauseIcon';
import { PlayIcon } from '@components/icons/PlayIcon';
import { Box, IconButton, makeStyles, Slider, Tooltip, Typography } from '@material-ui/core';
import { Fullscreen } from '@material-ui/icons';
import clsx from 'clsx';
import * as React from 'react';

import { VolumeControl } from './VolumeControl';

export enum PlayState {
  Playing,
  Paused,
}

export interface IMediaControlsProps {
  onSeek: (timestamp: number, stillSeeking: boolean) => any;
  /** in seconds */
  timestamp: number;
  onPlayStateChanged: (playState: PlayState, timestamp: number) => any;
  playState: PlayState;
  className?: string;
  duration: number;
  onFullscreen?: () => void;
  repeat?: boolean;
  onRepeatChanged?: (newValue: boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.common.black,
    borderRadius: 6,
  },
  slider: {
    flex: 1,
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
  },
  timeDisplay: {
    fontSize: theme.typography.pxToRem(12),
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
}));

const stopPropagation = (ev: any) => {
  ev.stopPropagation();
};

export const MediaControls: React.FC<IMediaControlsProps> = ({
  timestamp,
  playState,
  onSeek,
  onPlayStateChanged,
  className,
  duration,
  onFullscreen,
  repeat,
  onRepeatChanged,
}) => {
  const classes = useStyles();

  const togglePlayState = (ev: any) => {
    if (playState === PlayState.Paused) {
      // if we start playing and the duration is already at the max,
      // reset duration
      const newTs = timestamp >= duration ? 0 : timestamp;
      onPlayStateChanged(PlayState.Playing, newTs);
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

  // resets when reaching the end if not repeating
  const shouldPause = playState !== PlayState.Paused && !repeat && duration > 0 && timestamp >= duration;
  React.useEffect(() => {
    if (shouldPause) {
      onPlayStateChanged(PlayState.Paused, timestamp);
    }
  }, [shouldPause, onPlayStateChanged, timestamp]);

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      p={0.5}
      className={clsx(classes.root, className)}
      onPointerMove={stopPropagation}
      onPointerDown={stopPropagation}
      onPointerUp={stopPropagation}
      onClick={stopPropagation}
    >
      <IconButton onClick={togglePlayState} size="small" color="inherit">
        {playState === PlayState.Playing ? <PauseIcon /> : <PlayIcon />}
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
      <TimeDisplay value={timestamp} className={classes.timeDisplay} />
      {onRepeatChanged && (
        <IconButton
          size="small"
          onClick={() => {
            onRepeatChanged(!repeat);
          }}
          style={{ opacity: repeat ? 1 : 0.5 }}
        >
          <LoopIcon />
        </IconButton>
      )}
      <VolumeControl />
      {onFullscreen && (
        <IconButton size="small" onClick={onFullscreen}>
          <Fullscreen />
        </IconButton>
      )}
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

const TimeDisplay: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <Typography aria-label="current video time" className={className}>
    {toTimestampString(value)}
  </Typography>
);

function addTimeSinceLastPlayToTimestamp(timestamp: number, lastPlayedUTC: string | null) {
  if (lastPlayedUTC) {
    const delta = new Date().getSeconds() - new Date(lastPlayedUTC).getSeconds();
    return timestamp + delta;
  }
  return timestamp;
}

const defaultMediaState = {
  isPlaying: false,
  timestamp: 0,
  playStartedTimestampUtc: null,
  isRepeatOn: false,
  volume: 0.5,
};

/**
 * A hook for binding a basic HTML media element (<video /> or <audio />) to MediaControls.
 * Pass the provided ref to the media element, and spread the props into the MediaControls.
 */
export function useBindMediaControls(
  mediaState: WidgetMediaState | undefined,
  onMediaStateChanged: (mediaState: WidgetMediaState) => void,
  { allowFullscreen, allowRepeat }: { allowFullscreen: boolean; allowRepeat: boolean } = {
    allowFullscreen: false,
    allowRepeat: false,
  }
) {
  // this hook can be called without a current mediaState - we sub in defaults. This
  // seamlessly adds a mediaState when media playback begins
  const defaultedMediaState = mediaState || defaultMediaState;
  const { isPlaying, timestamp = 0, playStartedTimestampUtc, isRepeatOn = false, volume } = defaultedMediaState;

  const saveState = React.useCallback(
    (state: Partial<WidgetMediaState>) => {
      onMediaStateChanged({
        ...defaultedMediaState,
        ...state,
      });
    },
    [onMediaStateChanged, defaultedMediaState]
  );

  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>();

  const [isScrubbing, setIsScrubbing] = React.useState(false);

  const [duration, setDuration] = React.useState(0);

  // FIXME: setting state frequently is not recommended. Transition this out of the React lifecycle.
  const [realtimeTimestamp, setRealtimeTimestamp] = React.useState(0);

  const onSeek = React.useCallback(
    (ts: number, stillSeeking: boolean) => {
      setIsScrubbing(stillSeeking);

      // immediately update local UI
      setRealtimeTimestamp(ts);

      // only send to server when scrubber is released
      if (!stillSeeking) {
        saveState({
          isPlaying,
          timestamp: ts,
          // if not playing, we don't set this timestamp - it will be set when a user
          // presses play
          playStartedTimestampUtc: isPlaying ? new Date().toUTCString() : null,
        });
      }
    },
    [isPlaying, saveState]
  );

  const onPlayStateChanged = React.useCallback(
    (playState: PlayState, ts: number) => {
      saveState({
        isPlaying: playState === PlayState.Playing,
        playStartedTimestampUtc: playState === PlayState.Playing ? new Date().toUTCString() : null,
        timestamp: ts,
      });
      setRealtimeTimestamp(ts);
    },
    [saveState]
  );

  const onRepeatChanged = React.useCallback(
    (newState: boolean) => {
      saveState({
        isRepeatOn: newState,
      });
    },
    [saveState]
  );

  const onFullscreen = React.useCallback(() => {
    mediaRef.current?.requestFullscreen();
  }, []);

  const playState = isPlaying ? PlayState.Playing : PlayState.Paused;

  // get duration when media element loads
  React.useEffect(() => {
    const mediaEl = mediaRef.current;
    if (!mediaEl) {
      return;
    }

    if (mediaEl.duration && !isNaN(mediaEl.duration)) {
      setDuration(mediaEl.duration);
    }

    const onDurationChange = () => {
      setDuration(mediaEl.duration);
    };
    mediaEl.addEventListener('durationchange', onDurationChange);

    const onCurrentTimeChange = () => {
      // filter out 0 - this is just the initial element load. There's no valid
      // scenario (at the moment) where the underlying video element could advance
      // to 0 that we'd want to send that to the server.
      if (mediaEl.currentTime === 0) return;
      setRealtimeTimestamp(mediaEl.currentTime);
    };
    mediaEl.addEventListener('timeupdate', onCurrentTimeChange);

    return () => {
      mediaEl.removeEventListener('durationchange', onDurationChange);
      mediaEl.removeEventListener('timeupdate', onCurrentTimeChange);
    };
  }, []);

  // when the server timestamp changes, update the media too
  React.useEffect(() => {
    // don't interrupt user scrubbing when server timestamp changes
    if (!mediaRef.current || isScrubbing) return;

    const cumulativeTimestamp = addTimeSinceLastPlayToTimestamp(timestamp, playStartedTimestampUtc);
    mediaRef.current.currentTime = cumulativeTimestamp;
  }, [timestamp, playStartedTimestampUtc, isScrubbing]);

  // when play state changes, update the media
  React.useEffect(() => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
  }, [isPlaying]);

  // when repeat state changes, update the media
  React.useEffect(() => {
    if (!mediaRef.current) return;
    mediaRef.current.loop = isRepeatOn;
  }, [isRepeatOn]);

  // when volume state changes, update media
  React.useEffect(() => {
    if (!mediaRef.current) return;
    mediaRef.current.volume = volume || 0.5;
  }, [volume]);

  const controlsProps = {
    duration,
    timestamp: realtimeTimestamp,
    playState,
    onSeek,
    onPlayStateChanged,
    onFullscreen: allowFullscreen ? onFullscreen : undefined,
    repeat: isRepeatOn,
    onRepeatChanged: allowRepeat ? onRepeatChanged : undefined,
  };

  return [mediaRef, controlsProps] as const;
}
