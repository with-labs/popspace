import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import YouTube from 'react-youtube';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditYoutubeWidgetForm } from './EditYoutubeWidgetForm';
import { YoutubeWidgetState, YoutubeWidgetData } from '../../../../types/room';
import { VideoControls } from './VideoControls';
import { useSyncYoutube } from './useSyncYoutube';
import { MuteButton } from './MuteButton';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { useRemeasureWidget } from '../useRemeasureWidget';

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
    width: '100%',
    height: '100%',
    position: 'relative',
    // this is the best way I can find to target the YouTube player container itself
    '& > div:first-child': {
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
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

export const YoutubeWidget: React.FC<IYoutubeWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const localParticipant = useLocalParticipant();
  const { t } = useTranslation();

  const saveWidget = useSaveWidget(state.id);
  const remeasure = useRemeasureWidget(state.id);
  const handleSubmit = React.useCallback(
    (data: YoutubeWidgetData) => {
      saveWidget(data);
      remeasure();
    },
    [saveWidget, remeasure]
  );

  const { videoControlBindings, youtubeBindings, isMuted, isPlaying, toggleMuted } = useSyncYoutube(state, saveWidget);

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <WidgetFrame color="cherry" widgetId={state.id} minWidth={300} minHeight={200} maxWidth={400} maxHeight={300}>
        <WidgetTitlebar title={t('widgets.youtube.title')} onClose={onClose} />
        <WidgetContent>
          <EditYoutubeWidgetForm onSave={handleSubmit} />
        </WidgetContent>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame
      color="cherry"
      widgetId={state.id}
      isResizable
      minWidth={480}
      minHeight={308}
      maxWidth={1440}
      maxHeight={900}
    >
      <WidgetTitlebar title={t('widgets.youtube.title')} onClose={onClose}>
        <MuteButton isPlaying={isPlaying} isMuted={isMuted} onClick={toggleMuted} />
      </WidgetTitlebar>
      <WidgetContent disablePadding className={classes.videoContainer}>
        <YouTube opts={DEFAULT_OPTS} videoId={state.data.videoId} className={classes.video} {...youtubeBindings} />
        <VideoControls className={classes.videoControls} {...videoControlBindings} />
      </WidgetContent>
    </WidgetFrame>
  );
};
