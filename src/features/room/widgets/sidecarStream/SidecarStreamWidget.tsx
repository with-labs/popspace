import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { useTranslation } from 'react-i18next';
import { WidgetContent } from '../WidgetContent';
import { makeStyles } from '@material-ui/core';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { Fullscreen } from '@material-ui/icons';
import { MinimizeIcon } from '../../../../components/icons/MinimizeIcon';
import { MuteButton } from '../MuteButton';
import { useNamedPublication } from '../../../../providers/twilio/hooks/useNamedPublication';
import { SidecarStreamWidgetState, WidgetType } from '../../../../roomState/types/widgets';
import { WidgetAuthor } from '../WidgetAuthor';
import { FullscreenableMedia } from '../../../../components/FullscreenableMedia/FullscreenableMedia';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { SCREEN_SHARE_AUDIO_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '../../../../constants/User';
import { DeleteIcon } from '../../../../components/icons/DeleteIcon';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import { useLocalTracks } from '../../../../providers/media/hooks/useLocalTracks';
import { useLocalParticipant } from '../../../../providers/twilio/hooks/useLocalParticipant';
import { useParticipantByIdentity } from '../../../../providers/twilio/hooks/useParticipantByIdentity';

/**
 * Number of ms to wait for a disconnected user to reconnect and resume stream.
 * After this time has expired, the widget will delete itself.
 */
const WAIT_FOR_RECONNECT_TIME = 10000;

export interface IScreenShareWidgetProps {}

const useStyles = makeStyles((theme) => ({
  screenShare: {
    width: '100%',
    height: '100%',
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

  const isOwnStream = useCurrentUserProfile().user?.id === state.ownerId;
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
  }, [streamType, stopVideo, stopAudio, stopScreenShare, isLocalDeviceStream]);

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
    <WidgetFrame color={ThemeName.Slate}>
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
        <WidgetResizeContainer
          mode="free"
          minWidth={400}
          minHeight={200}
          maxWidth={2000}
          maxHeight={2000}
          /*
            Initial sizing is disabled for everyone but the broadcasting device - otherwise
            when new users join the room they will mount the widget and it will be remeasured and resized.
          */
          disableInitialSizing={!isLocalDeviceStream}
        >
          <FullscreenableMedia
            className={classes.screenShare}
            isFullscreen={isFullscreen}
            onFullscreenExit={onExitFullscreen}
            objectId={state.widgetId}
            muted={isLocalMuted}
            videoPublication={videoPublication}
            audioPublication={audioPublication}
          />
          <WidgetResizeHandle />
        </WidgetResizeContainer>
      </WidgetContent>
    </WidgetFrame>
  );
};
