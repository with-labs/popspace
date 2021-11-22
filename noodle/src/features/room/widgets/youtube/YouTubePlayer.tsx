import * as React from 'react';
import YouTube from 'react-youtube';
import { MediaControls } from '../common/MediaControls';
import { useSyncYoutube } from './useSyncYoutube';
import { makeStyles } from '@material-ui/core';
import { YoutubeWidgetShape, YoutubeWidgetState } from '@api/roomState/types/widgets';

export interface IYouTubePlayerProps {
  isMuted?: boolean;
  state: YoutubeWidgetShape;
  onChange: (data: Partial<YoutubeWidgetState>) => void;
}

// number of seconds we allow YT players to be out of sync by
const DEFAULT_OPTS = {
  width: '480',
  height: '270',
  playerVars: {
    // turn off native controls, we have our own
    controls: 0 as const,
  },
};

const useStyles = makeStyles((theme) => ({
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'black',
    // this is the best way I can find to target the YouTube player container itself
    '& > div:first-child': {
      width: '100%',
      height: '100%',
    },
    '&:hover, &:focus': {
      '& > $videoControls': {
        visibility: 'visible',
        pointerEvents: 'initial',
      },
    },
  },
  videoControls: {
    position: 'absolute',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    right: theme.spacing(2),

    visibility: 'hidden',
    pointerEvents: 'none',

    zIndex: 5,
    // BUGFIX: chromium #1068474, layers are composited incorrectly with iframe/canvas and the controls are
    // hidden beneath the video despite being above it
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1068474&q=overflow%20hidden%20scale&can=2
    // will-change: top fixes this behavior as a hack.
    willChange: 'top',

    '&:focus-within': {
      visibility: 'visible',
      pointerEvents: 'initial',
    },
  },
  video: {
    width: '100%',
    height: '100%',
  },
}));

// memoizing YouTube - so that it won't re-render when the parent's useSyncYoutube hook changes if
// the changes are only applicable to the VideoControls. This is frequently the case because
// useSyncYoutube stores the current timestamp in useState, so it will update at least every second
// with data that only matters to VideoControls, not YouTube. So we want YouTube to ignore that
// re-render, which memoization does for us.
const MemoizedYouTube = React.memo(YouTube);

/**
 * Renders an interactive, peer-synced YouTube player
 */
export const YouTubePlayer: React.FC<IYouTubePlayerProps> = ({ state, onChange, isMuted }) => {
  const classes = useStyles();

  const { youtubeBindings, videoControlBindings } = useSyncYoutube({
    state,
    onChange,
    isMuted,
  });

  return (
    <div className={classes.videoContainer}>
      <MemoizedYouTube
        opts={DEFAULT_OPTS}
        videoId={state.widgetState.videoId}
        className={classes.video}
        {...youtubeBindings}
      />
      <MediaControls className={classes.videoControls} {...videoControlBindings} />
    </div>
  );
};
