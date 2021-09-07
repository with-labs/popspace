import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { useTranslation } from 'react-i18next';
import { WidgetContent } from '../WidgetContent';
import { makeStyles } from '@material-ui/core';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { Fullscreen } from '@material-ui/icons';
import { MinimizeIcon } from '@components/icons/MinimizeIcon';
import { MuteButton } from '../MuteButton';
import { useNamedPublication } from '@providers/twilio/hooks/useNamedPublication';
import { SidecarStreamWidgetState, WidgetType } from '@api/roomState/types/widgets';
import { WidgetAuthor } from '../WidgetAuthor';
import { FullscreenableMedia } from '@components/FullscreenableMedia/FullscreenableMedia';
import { SCREEN_SHARE_AUDIO_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '@constants/User';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import { useLocalTracks } from '@providers/media/hooks/useLocalTracks';
import { useLocalParticipant } from '@providers/twilio/hooks/useLocalParticipant';
import { useParticipantByIdentity } from '@providers/twilio/hooks/useParticipantByIdentity';
import { MAX_SIZE, MIN_SIZE } from './constants';
import { useIsMe } from '@api/useIsMe';

/**
 * Number of ms to wait for a disconnected user to reconnect and resume stream.
 * After this time has expired, the widget will delete itself.
 */
const WAIT_FOR_RECONNECT_TIME = 10000;

export interface IScreenShareWidgetProps {}

const useStyles = makeStyles((theme) => ({
  screenShare: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
}));

function inferStreamType(widgetState: SidecarStreamWidgetState): 'screen' | 'av' {
  if (widgetState.videoTrackName) {
    return widgetState.videoTrackName.startsWith(SCREEN_SHARE_TRACK_NAME) ? 'screen' : 'av';
  } else {
    return widgetState.audioTrackName?.startsWith(SCREEN_SHARE_AUDIO_TRACK_NAME) ? 'screen' : 'av';
  }
}

export const ScreenShareWidget: React.FC<IScreenShareWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { remove: onClose, widget: state } = useWidgetContext<WidgetType.SidecarStream>();

  const participant = useParticipantByIdentity(state.widgetState.twilioParticipantIdentity);

  React.useEffect(() => {
    if (!participant) {
      const timeout = setTimeout(onClose, WAIT_FOR_RECONNECT_TIME);
      return () => clearTimeout(timeout);
    }
  }, [onClose, participant]);

  const isOwnStream = useIsMe(state.creatorId);
  const isLocalDeviceStream = useLocalParticipant()?.identity === state.widgetState.twilioParticipantIdentity;

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const onExitFullscreen = React.useCallback(() => setIsFullscreen(false), []);

  const [isLocalMuted, setIsLocalMuted] = React.useState(false);

  const videoPublication = useNamedPublication(participant, state.widgetState.videoTrackName ?? null);
  const audioPublication = useNamedPublication(participant, state.widgetState.audioTrackName ?? null);
  const isSharingAudio = !!audioPublication;

  const streamType = inferStreamType(state.widgetState);

  const { stopScreenShare, stopAudio, stopVideo } = useLocalTracks();
  const stopStreaming = React.useCallback(() => {
    // can only stop your own device's stream
    if (!isLocalDeviceStream) return;

    // figure out which streams to stop
    if (streamType === 'screen') {
      stopScreenShare();
    } else {
      stopVideo();
      stopAudio();
    }

    onClose();
  }, [streamType, stopVideo, stopAudio, stopScreenShare, isLocalDeviceStream, onClose]);

  const hasAnyMedia = !!videoPublication || !!audioPublication;

  React.useEffect(() => {
    if (!hasAnyMedia) {
      const timeout = setTimeout(onClose, WAIT_FOR_RECONNECT_TIME);
      return () => clearTimeout(timeout);
    }
  }, [onClose, hasAnyMedia]);

  const title = isOwnStream ? (
    t('widgets.sidecarStream.titleLocalUser')
  ) : (
    <span>
      <WidgetAuthor />
      {t('widgets.sidecarStream.titleEnding')}
    </span>
  );

  // the video stream is gone!
  // the effect above will remove this widget shortly - render nothing
  if (!hasAnyMedia) return null;

  return (
    <WidgetFrame
      color={ThemeName.Slate}
      minWidth={MIN_SIZE.width}
      minHeight={MIN_SIZE.height}
      maxWidth={MAX_SIZE.width}
      maxHeight={MAX_SIZE.height}
    >
      <WidgetTitlebar title={title} disableRemove>
        {/* Remote users can mute the stream for themselves */}
        {isSharingAudio && !isOwnStream && (
          <MuteButton isMuted={isLocalMuted} isPlaying onClick={() => setIsLocalMuted((v) => !v)} />
        )}
        {isOwnStream && (
          <WidgetTitlebarButton onClick={onClose}>
            <MinimizeIcon />
          </WidgetTitlebarButton>
        )}
        {!!participant && (
          <WidgetTitlebarButton onClick={() => setIsFullscreen(true)}>
            <Fullscreen />
          </WidgetTitlebarButton>
        )}
        {isLocalDeviceStream && (
          <WidgetTitlebarButton onClick={stopStreaming}>
            <DeleteIcon />
          </WidgetTitlebarButton>
        )}
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <FullscreenableMedia
          className={classes.screenShare}
          isFullscreen={isFullscreen}
          onFullscreenExit={onExitFullscreen}
          muted={isLocalMuted}
          videoPublication={videoPublication}
          audioPublication={audioPublication}
        />
        <WidgetResizeHandle />
      </WidgetContent>
    </WidgetFrame>
  );
};
