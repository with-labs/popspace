import * as React from 'react';
import { YoutubeWidgetState, WidgetData } from '../../../../types/room';
import { PlayState } from './VideoControls';
import { useSpatialAudioVolume } from '../../../../withHooks/useSpatialAudioVolume/useSpatialAudioVolume';

function addTimeSinceLastPlayToTimestamp(timestamp: number, lastPlayedUTC: string | null) {
  if (lastPlayedUTC) {
    const delta = new Date().getSeconds() - new Date(lastPlayedUTC).getSeconds();
    return timestamp + delta;
  }
  return timestamp;
}

/**
 * Handles all the synchronization of Youtube player state to the
 * synchronized widget state, including keeping everyone's timestamps
 * up to speed.
 *
 * There are several concerns going on here -
 * 1. updating the player with values which come through from our Redux store, when they change
 * 2. updating the Redux store with values that come from the player itself
 * 3. updating both the player and the redux store with values that come from our custom video controls.
 */
export function useSyncYoutube(state: YoutubeWidgetState, update: (data: Partial<WidgetData>) => any) {
  const isPlaying = state.data.isPlaying || false;
  const playState = isPlaying ? PlayState.Playing : PlayState.Paused;
  const timestamp = state.data.timestamp ?? 0;
  const playStartedTimestampUTC = state.data.playStartedTimestampUTC;
  const [duration, setDuration] = React.useState(0);
  const ytPlayerRef = React.useRef<YT.Player | null>(null);
  const [realtimeTimestamp, setRealtimeTimestamp] = React.useState(0);
  const [isScrubbing, setScrubbing] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  // when the user pauses or plays in the custom video controls,
  // also pause/play in Redux and sync to remote users
  const onPlayStateChanged = React.useCallback(
    (s: PlayState, time: number) => {
      update({
        isPlaying: s === PlayState.Playing,
        playStartedTimestampUTC: s === PlayState.Playing ? new Date().toUTCString() : null,
        timestamp: time,
      });
    },
    [update]
  );

  // when the user moves the scrubber on the custom video controls,
  // inform everyone else of the time change and update the time in the YT player
  const onSeek = React.useCallback(
    (time: number, scrubbing: boolean) => {
      setScrubbing(scrubbing);
      ytPlayerRef.current?.seekTo(time, !scrubbing);
      setRealtimeTimestamp(time);

      // don't sent it to others until the user has released the scrubber handle
      if (!scrubbing) {
        update({
          timestamp: time,
          playStartedTimestampUTC: playState === PlayState.Playing ? new Date().toUTCString() : null,
        });
      }
    },
    [update, playState]
  );

  // when the YT player is playing, update Redux to play too and
  // record the current timestamp and play start time
  const handlePlayerPlay = React.useCallback(
    (ev: { target: YT.Player }) => {
      const player = ev.target;

      if (isPlaying) {
        // already playing, do nothing
        return;
      }

      update({
        isPlaying: true,
        timestamp: player.getCurrentTime(),
        playStartedTimestampUTC: new Date().toUTCString(),
      });
    },
    [isPlaying, update]
  );

  // when the YT player is paused, update Redux to be paused too and record
  // the current timestamp
  const handlePlayerPause = React.useCallback(
    (ev: { target: YT.Player }) => {
      const player = ev.target;

      if (!isPlaying) {
        // already paused, do nothing
        return;
      }

      update({
        isPlaying: false,
        timestamp: player.getCurrentTime(),
        playStartedTimestampUTC: null,
      });
    },
    [isPlaying, update]
  );

  // when the YT player is in a ready state, immediately synchronize it to the latest
  // redux data
  const handleReady = React.useCallback(
    (ev: { target: YT.Player }) => {
      const p = ev.target;
      ytPlayerRef.current = ev.target;
      if (!p) return;

      // immediately sync to current timestamp and play state, utilizing
      // the time since the last play event
      const cumulativeTimestamp = addTimeSinceLastPlayToTimestamp(timestamp, playStartedTimestampUTC);
      p.seekTo(cumulativeTimestamp, true);
      setRealtimeTimestamp(cumulativeTimestamp);
      if (!isPlaying) {
        p.pauseVideo();
      } else {
        p.playVideo();
      }

      // also update our duration value
      setDuration(p.getDuration());
    },
    [timestamp, isPlaying, playStartedTimestampUTC]
  );

  // when the Redux timestamp changes, seek in the YT player too
  React.useEffect(() => {
    if (!ytPlayerRef.current) return;

    const cumulativeTimestamp = addTimeSinceLastPlayToTimestamp(timestamp, playStartedTimestampUTC);
    // don't seek forward in time if the user is still scrubbing
    ytPlayerRef.current.seekTo(cumulativeTimestamp, !isScrubbing);
  }, [timestamp, playStartedTimestampUTC, isScrubbing]);

  // when the Redux play state changes, change the YT player state in response
  React.useEffect(() => {
    if (!ytPlayerRef.current) return;

    if (!isPlaying) {
      ytPlayerRef.current.pauseVideo();
    } else {
      ytPlayerRef.current.playVideo();
    }
  }, [isPlaying]);

  // update the scrubber on a consistent timestep - there's no more elegant way
  // to do this that I know of...
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeTimestamp(ytPlayerRef.current?.getCurrentTime() ?? 0);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // change the volume using spatial audio
  const naturalVolume = useSpatialAudioVolume(state.id);
  const volume = isMuted ? 0 : naturalVolume;
  React.useEffect(() => {
    ytPlayerRef.current?.setVolume(volume * 100);
  }, [volume]);

  const toggleMuted = React.useCallback(() => {
    setIsMuted((v) => !v);
  }, [setIsMuted]);

  return {
    videoControlBindings: {
      onPlayStateChanged,
      onSeek,
      timestamp: realtimeTimestamp,
      playState,
      duration,
    },
    youtubeBindings: {
      onReady: handleReady,
      onPlay: handlePlayerPlay,
      onPause: handlePlayerPause,
    },
    isMuted,
    toggleMuted,
    isPlaying,
  };
}
