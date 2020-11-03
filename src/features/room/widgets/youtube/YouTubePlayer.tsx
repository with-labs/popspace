import * as React from 'react';
import YouTube from 'react-youtube';
import { VideoControls } from './VideoControls';
import { useSyncYoutube } from './useSyncYoutube';
import { useResizeContext } from '../../../../components/ResizeContainer/ResizeContainer';
import { YoutubeWidgetData, YoutubeWidgetState } from '../../../../types/room';
import { makeStyles } from '@material-ui/core';

export interface IYouTubePlayerProps {
  isMuted?: boolean;
  state: YoutubeWidgetState;
  onChange: (data: Partial<YoutubeWidgetData>) => void;
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
    position: 'relative',
    background: 'black',
    // this is the best way I can find to target the YouTube player container itself
    '& > div:first-child': {
      width: '100%',
      height: '100%',
      minWidth: 480,
      minHeight: 270,
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

/**
 *
 */
export const YouTubePlayer: React.FC<IYouTubePlayerProps> = ({ state, onChange, isMuted }) => {
  const classes = useStyles();

  const { remeasure } = useResizeContext();
  const handleLoad = React.useCallback(() => {
    setTimeout(remeasure);
  }, [remeasure]);
  const { youtubeBindings, videoControlBindings } = useSyncYoutube({
    state,
    onChange,
    onLoad: handleLoad,
    isMuted,
  });

  return (
    <div className={classes.videoContainer}>
      <YouTube opts={DEFAULT_OPTS} videoId={state.data.videoId} className={classes.video} {...youtubeBindings} />
      <VideoControls className={classes.videoControls} {...videoControlBindings} />
    </div>
  );
};
