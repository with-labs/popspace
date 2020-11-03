import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useLocalParticipant } from '../../../../hooks/useLocalParticipant/useLocalParticipant';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditYoutubeWidgetForm } from './EditYoutubeWidgetForm';
import { YoutubeWidgetState, YoutubeWidgetData } from '../../../../types/room';
import { MuteButton } from './MuteButton';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { YouTubePlayer } from './YouTubePlayer';

export interface IYoutubeWidgetProps {
  state: YoutubeWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  videoContainer: {
    position: 'relative',
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

export const YoutubeWidget: React.FC<IYoutubeWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const localParticipant = useLocalParticipant();
  const { t } = useTranslation();

  const saveWidget = useSaveWidget(state.id);

  const [isMuted, setIsMuted] = React.useState(false);
  const toggleMuted = () => setIsMuted((v) => !v);

  const isPlaying = !!state.data.isPlaying;

  const handleVideoChange = (data: Partial<YoutubeWidgetData>) => {
    saveWidget(data);
  };

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <WidgetFrame color="cherry" widgetId={state.id}>
        <WidgetTitlebar title={t('widgets.youtube.title')} onClose={onClose} />
        <WidgetContent>
          <EditYoutubeWidgetForm onSave={saveWidget} />
        </WidgetContent>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame color="cherry" widgetId={state.id}>
      <WidgetTitlebar title={t('widgets.youtube.title')} onClose={onClose}>
        <MuteButton isPlaying={isPlaying} isMuted={isMuted} onClick={toggleMuted} />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <WidgetResizeContainer
          widgetId={state.id}
          minWidth={480}
          minHeight={270}
          maxWidth={1440}
          maxHeight={900}
          className={classes.videoContainer}
          mode="scale"
        >
          <YouTubePlayer state={state} onChange={handleVideoChange} isMuted={isMuted} />
          <WidgetResizeHandle />
        </WidgetResizeContainer>
      </WidgetContent>
    </WidgetFrame>
  );
};
