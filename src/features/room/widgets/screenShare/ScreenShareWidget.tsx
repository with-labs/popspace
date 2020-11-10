import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import useParticipantDisplayIdentity from '../../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useParticipant } from '../../../../hooks/useParticipant/useParticipant';
import { ScreenShareWidgetState } from '../../../../types/room';
import { useLocalParticipant } from '../../../../hooks/useLocalParticipant/useLocalParticipant';
import { useTranslation } from 'react-i18next';
import { WidgetContent } from '../WidgetContent';
import { makeStyles } from '@material-ui/core';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { ScreenShareViewer } from './ScreenShareViewer';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { Fullscreen } from '@material-ui/icons';
import { DeleteIcon } from '../../../../components/icons/DeleteIcon';
import { MinimizeIcon } from '../../../../components/icons/MinimizeIcon';
import { MuteButton } from '../MuteButton';
import usePublications from '../../../../hooks/usePublications/usePublications';
import { SCREEN_SHARE_AUDIO_TRACK_NAME } from '../../../../constants/User';
import { useLocalTracks } from '../../../../components/LocalTracksProvider/useLocalTracks';

export interface IScreenShareWidgetProps {
  state: ScreenShareWidgetState;
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  screenShare: {
    width: '100%',
    height: '100%',
  },
}));

export const ScreenShareWidget: React.FC<IScreenShareWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const sharingUserId = state.participantSid;
  const user = useParticipant(sharingUserId);
  const localParticipant = useLocalParticipant();
  const username = useParticipantDisplayIdentity(user);

  React.useEffect(() => {
    if (!user && sharingUserId) {
      onClose();
    }
  }, [onClose, user, sharingUserId]);

  const isLocal = user === localParticipant;

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const onExitFullscreen = React.useCallback(() => setIsFullscreen(false), []);

  const [isLocalMuted, setIsLocalMuted] = React.useState(false);

  const { stopScreenShare } = useLocalTracks();
  const onStopSharing = React.useCallback(() => {
    stopScreenShare();
    onClose();
  }, [stopScreenShare, onClose]);

  const publications = usePublications(user);
  const isSharingAudio = publications.some((p) => p.trackName === SCREEN_SHARE_AUDIO_TRACK_NAME);

  const title = !sharingUserId
    ? t('widgets.screenShare.titleEmpty')
    : isLocal
    ? t('widgets.screenShare.titleLocalUser')
    : t('widgets.screenShare.title', { username });

  return (
    <WidgetFrame color="slate" widgetId={state.id}>
      <WidgetTitlebar title={title}>
        {/* Remote users can mute the stream for themselves */}
        {isSharingAudio && !isLocal && (
          <MuteButton isMuted={isLocalMuted} isPlaying onClick={() => setIsLocalMuted((v) => !v)} />
        )}
        {isLocal && (
          <WidgetTitlebarButton onClick={onClose}>
            <MinimizeIcon />
          </WidgetTitlebarButton>
        )}
        {!!sharingUserId && (
          <WidgetTitlebarButton onClick={() => setIsFullscreen(true)}>
            <Fullscreen />
          </WidgetTitlebarButton>
        )}
        {isLocal && (
          <WidgetTitlebarButton onClick={onStopSharing}>
            <DeleteIcon />
          </WidgetTitlebarButton>
        )}
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <WidgetResizeContainer
          widgetId={state.id}
          mode="free"
          minWidth={400}
          minHeight={200}
          maxWidth={2000}
          maxHeight={2000}
        >
          <ScreenShareViewer
            participantSid={state.participantSid}
            className={classes.screenShare}
            isFullscreen={isFullscreen}
            onFullscreenExit={onExitFullscreen}
            onShareEnd={onClose}
            widgetId={state.id}
            muted={isLocalMuted}
          />
          <WidgetResizeHandle />
        </WidgetResizeContainer>
      </WidgetContent>
    </WidgetFrame>
  );
};
