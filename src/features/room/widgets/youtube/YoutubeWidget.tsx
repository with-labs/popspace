import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';
import YouTube from 'react-youtube';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditYoutubeWidgetForm } from './EditYoutubeWidgetForm';
import { YoutubeWidgetState } from '../../../../types/room';
import { VideoControls } from './VideoControls';
import { useSyncYoutube } from './useSyncYoutube';

export interface IYoutubeWidgetProps {
  state: YoutubeWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
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
    // for some reason there's a little gap at the bottom of the iframe,
    // this removes it.
    marginBottom: -6,
    position: 'relative',
    '&:hover, &:focus': {
      '& > $videoControls': {
        visibility: 'visible',
        pointerEvents: 'initial',
      },
    },
  },
  videoControls: {
    position: 'absolute',
    // add the pixels we subtracted above
    bottom: theme.spacing(2) + 6,
    left: theme.spacing(2),
    right: theme.spacing(2),

    visibility: 'hidden',
    pointerEvents: 'none',

    '&:focus-within': {
      visibility: 'visible',
      pointerEvents: 'initial',
    },
  },
}));

export const YoutubeWidget: React.FC<IYoutubeWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const localParticipant = useLocalParticipant();

  const saveWidget = useSaveWidget(state.id);

  const { videoControlBindings, youtubeBindings } = useSyncYoutube(state, saveWidget);

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <WidgetFrame color="cherry">
        <WidgetTitlebar title="YouTube - beta" onClose={onClose} />
        <Box p={2} width={270}>
          <EditYoutubeWidgetForm onSave={saveWidget} />
        </Box>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame color="cherry">
      <WidgetTitlebar title="YouTube - beta" onClose={onClose} />
      <Box className={classes.videoContainer}>
        <YouTube opts={DEFAULT_OPTS} videoId={state.data.videoId} {...youtubeBindings} />
        <VideoControls className={classes.videoControls} {...videoControlBindings} />
      </Box>
    </WidgetFrame>
  );
};
