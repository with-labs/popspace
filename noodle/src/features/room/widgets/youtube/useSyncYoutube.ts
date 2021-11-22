import { YoutubeWidgetShape, YoutubeWidgetState } from '@api/roomState/types/widgets';
import { useSpatialAudioVolume } from '@hooks/useSpatialAudioVolume/useSpatialAudioVolume';
import * as React from 'react';

import { PlayState } from '../common/MediaControls';

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
export function useSyncYoutube({
  state,
  onChange,
  onLoad,
  isMuted,
}: {
  state: YoutubeWidgetShape;
  onChange: (data: Partial<YoutubeWidgetState>) => any;
  onLoad?: () => void;
  isMuted?: boolean;
}) {
  const {
    isPlaying = false,
    timestamp = 0,
    playStartedTimestampUtc = null,
    volume = 0.5,
  } = state.widgetState.mediaState || {
    isPlaying: false,
    timestamp: 0,
    playStartedTimestampUtc: null,
    volume: 0.5,
  };

  const playState = isPlaying ? PlayState.Playing : PlayState.Paused;
  const [duration, setDuration] = React.useState(0);
  const ytPlayerRef = React.useRef<YT.Player | null>(null);
  const [realtimeTimestamp, setRealtimeTimestamp] = React.useState(0);
  const [isScrubbing, setScrubbing] = React.useState(false);

  // when the user pauses or plays in the custom video controls,
  // also pause/play in Redux and sync to remote users
  const onPlayStateChanged = React.useCallback(
    (s: PlayState, time: number) => {
      onChange({
        mediaState: {
          volume,
          isPlaying: s === PlayState.Playing,
          playStartedTimestampUtc: s === PlayState.Playing ? new Date().toUTCString() : null,
          timestamp: time,
        },
      });
    },
    [onChange, volume]
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
        onChange({
          mediaState: {
            volume,
            isPlaying,
            timestamp: time,
            playStartedTimestampUtc: playState === PlayState.Playing ? new Date().toUTCString() : null,
          },
        });
      }
    },
    [onChange, playState, isPlaying, volume]
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

      onChange({
        mediaState: {
          volume,
          isPlaying: true,
          timestamp: player.getCurrentTime(),
          playStartedTimestampUtc: new Date().toUTCString(),
        },
      });
    },
    [isPlaying, onChange, volume]
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

      onChange({
        mediaState: {
          volume,
          isPlaying: false,
          timestamp: player.getCurrentTime(),
          playStartedTimestampUtc: null,
        },
      });
    },
    [isPlaying, onChange, volume]
  );

  const handleSpatialVolumeChange = React.useCallback(
    (newVolume: number) => {
      if (isMuted) return;
      // multiplying by the player volume control value, too
      ytPlayerRef.current?.setVolume(volume * newVolume * 100);
    },
    [ytPlayerRef, isMuted, volume]
  );

  // get the current spacial volume state of the player
  const lastSpatialVolumeRef = useSpatialAudioVolume(handleSpatialVolumeChange);

  // handle muting
  React.useEffect(() => {
    const vol = isMuted ? 0 : lastSpatialVolumeRef.current * volume * 100;
    ytPlayerRef.current?.setVolume(vol);
  }, [isMuted, ytPlayerRef, lastSpatialVolumeRef, volume]);

  // when the YT player is in a ready state, immediately synchronize it to the latest
  // redux data
  const handleReady = React.useCallback(
    (ev: { target: YT.Player }) => {
      const p = ev.target;
      ytPlayerRef.current = ev.target;
      if (!p) return;

      // set the current volume based on the spacial audio
      if (isMuted) {
        p.setVolume(0);
      } else {
        p.setVolume(lastSpatialVolumeRef.current * volume * 100);
      }

      // immediately sync to current timestamp and play state, utilizing
      // the time since the last play event
      const cumulativeTimestamp = addTimeSinceLastPlayToTimestamp(timestamp, playStartedTimestampUtc);
      p.seekTo(cumulativeTimestamp, true);
      setRealtimeTimestamp(cumulativeTimestamp);
      if (!isPlaying) {
        p.pauseVideo();
      } else {
        p.playVideo();
      }

      // also update our duration value
      setDuration(p.getDuration());

      // finally, invoke the load handler if provided
      onLoad?.();
    },
    [timestamp, isPlaying, playStartedTimestampUtc, isMuted, lastSpatialVolumeRef, onLoad, volume]
  );

  // when the Redux timestamp changes, seek in the YT player too
  React.useEffect(() => {
    if (!ytPlayerRef.current) return;

    const cumulativeTimestamp = addTimeSinceLastPlayToTimestamp(timestamp, playStartedTimestampUtc);
    // don't seek forward in time if the user is still scrubbing
    ytPlayerRef.current.seekTo(cumulativeTimestamp, !isScrubbing);
  }, [timestamp, playStartedTimestampUtc, isScrubbing]);

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
    let animFrame: number | null = null;
    function loop() {
      const rounded = Math.round(ytPlayerRef.current?.getCurrentTime() ?? 0);
      setRealtimeTimestamp(rounded);
      animFrame = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    };
  }, []);

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
    isPlaying,
  };
}
