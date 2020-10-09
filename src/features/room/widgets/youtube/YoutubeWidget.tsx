import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';
import YouTube from 'react-youtube';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar, WidgetTitlebarProps } from '../WidgetTitlebar';
import { EditYoutubeWidgetForm } from './EditYoutubeWidgetForm';
import { YoutubeWidgetState, WidgetData } from '../../../../types/room';

export interface IYoutubeWidgetProps {
  state: YoutubeWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
  /**
   * Attach extra props to the titlebar - for instance
   * binding it to a drag gesture
   */
  titlebarProps?: Partial<WidgetTitlebarProps>;
}

// number of seconds we allow YT players to be out of sync by
const TIMESTAMP_SYNC_EPSILON = 0.5;
const DEFAULT_OPTS = {
  width: '480',
  height: '270',
};
const PLAY_STATE_PLAYING = 1;
const PLAY_STATE_PAUSED = 2;

// custom hook handles all the two-way synchronization of YouTube player
// state with peers.
function useSyncPlayState(state: YoutubeWidgetState, update: (data: Partial<WidgetData>) => any) {
  const playerRef = React.useRef<YT.Player | null>();

  const remoteTimestamp = state.data.timestamp || 0;
  const remoteIsPlaying = state.data.isPlaying;

  // syncing remote play state to local player
  React.useEffect(() => {
    if (!playerRef.current) return;

    const currentTimestamp = playerRef.current.getCurrentTime();
    if (Math.abs(remoteTimestamp - currentTimestamp) > TIMESTAMP_SYNC_EPSILON) {
      playerRef.current.seekTo(remoteTimestamp, true);
    }

    const isCurrentlyPlaying = playerRef.current.getPlayerState() === PLAY_STATE_PLAYING;
    if (isCurrentlyPlaying !== remoteIsPlaying) {
      if (remoteIsPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [remoteIsPlaying, remoteTimestamp]);

  // event handlers for syncing local player state to remote
  const onReady = React.useCallback(
    (ev: { target: YT.Player }) => {
      const player = (playerRef.current = ev.target);

      // if the player successfully started, seek to the
      // timestamp provided by our remote state and begin playing if
      // it's playing.
      if (player) {
        player.seekTo(remoteTimestamp, true);

        if (remoteIsPlaying) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }

        // QUIRK AHEAD -
        // I've updated this widget so that it will sync up the current timestamp
        // whenever the video state changes - that should help keep things more synced
        // between users. However, you need to add the handlers queued in a timeout,
        // because it's important NOT to handle this event when it's invoked by
        // either of the playVideo/pauseVideo above ^^^
        // That's because when a user first enters the room they get whatever
        // the latest report timestamp was - the best we can do. But we don't want
        // them to then sync that timestamp back to the rest of the people, which
        // would seem to them like the video skipped backwards. So we want to ignore
        // this initial state change and only start syncing timestamp later - because
        // of the way the JS event loop works, a setTimeout is necessary.
        setTimeout(() => {
          player.addEventListener('onStateChange', () => {
            update({
              isPlaying: player.getPlayerState() !== PLAY_STATE_PAUSED,
              timestamp: player.getCurrentTime(),
            });
          });
        });
      }
    },
    [remoteIsPlaying, remoteTimestamp, update]
  );

  // FIXME: play/pause will sync the timestamp, but it only works
  // because the player pauses when seeking for some reason. Otherwise,
  // we have no official event to track seeking - so one option
  // might be to set up a recurring interval using useEffect to
  // poll the video time, compare to remote, and decide if we want
  // to publish an updated time... however, the heuristic logic for
  // determining that seems complicated.

  return {
    onReady,
  };
}

const useStyles = makeStyles({
  videoContainer: {
    // for some reason there's a little gap at the bottom of the iframe,
    // this removes it.
    marginBottom: -6,
  },
});

export const YoutubeWidget: React.FC<IYoutubeWidgetProps> = ({ state, onClose, titlebarProps }) => {
  const classes = useStyles();
  const localParticipant = useLocalParticipant();

  const saveWidget = useSaveWidget(state.id);

  const youtubeBindings = useSyncPlayState(state, saveWidget);

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <WidgetFrame color="cherry">
        <WidgetTitlebar title="YouTube - beta" onClose={onClose} {...titlebarProps} />
        <Box p={2} width={270}>
          <EditYoutubeWidgetForm onSave={saveWidget} />
        </Box>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame color="cherry">
      <WidgetTitlebar title="YouTube - beta" onClose={onClose} {...titlebarProps} />
      <Box className={classes.videoContainer}>
        <YouTube opts={DEFAULT_OPTS} videoId={state.data.videoId} {...youtubeBindings} />
      </Box>
    </WidgetFrame>
  );
};
