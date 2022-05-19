import { SidecarStreamWidgetState, WidgetType } from '@api/roomState/types/widgets';
import { useIsMe } from '@api/useIsMe';
import { FullscreenableMedia } from '@components/FullscreenableMedia/FullscreenableMedia';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { MinimizeIcon } from '@components/icons/MinimizeIcon';
import { SCREEN_SHARE_AUDIO_TRACK_NAME, SCREEN_SHARE_TRACK_NAME } from '@constants/User';
import { makeStyles } from '@material-ui/core';
import { Fullscreen } from '@material-ui/icons';
import { media } from '@src/media';
import { useIsParticipantConnected, useParticipantTrack } from '@src/media/hooks';
import { TrackType } from '@withso/pop-media-sdk';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeName } from '../../../../theme/theme';
import { MuteButton } from '../MuteButton';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetAuthor } from '../WidgetAuthor';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { MAX_SIZE, MIN_SIZE } from './constants';

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
    '& video': {
      objectFit: 'contain',
    },
  },
  background: {
    backgroundColor: theme.palette.brandColors.ink.regular,
  },
}));

function inferStreamType(widgetState: SidecarStreamWidgetState): 'screen' | 'av' {
  if (widgetState.videoTrackType) {
    return widgetState.videoTrackType === TrackType.Screen ? 'screen' : 'av';
  } else {
    return widgetState.audioTrackType === TrackType.ScreenAudio ? 'screen' : 'av';
  }
}

export const ScreenShareWidget: React.FC<IScreenShareWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { remove: onClose, widget: state } = useWidgetContext<WidgetType.SidecarStream>();

  const mediaParticipantId = state.widgetState.mediaParticipantId;
  const isConnected = useIsParticipantConnected(mediaParticipantId);

  React.useEffect(() => {
    if (!isConnected) {
      const timeout = setTimeout(onClose, WAIT_FOR_RECONNECT_TIME);
      return () => clearTimeout(timeout);
    }
  }, [onClose, isConnected]);

  const isOwnStream = useIsMe(state.creatorId);
  const isLocalDeviceStream = mediaParticipantId === media.localParticipantId;

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const onExitFullscreen = React.useCallback(() => setIsFullscreen(false), []);

  const [isLocalMuted, setIsLocalMuted] = React.useState(false);

  let videoTrack = useParticipantTrack(mediaParticipantId, state.widgetState.videoTrackType ?? TrackType.Camera);
  let audioTrack = useParticipantTrack(mediaParticipantId, state.widgetState.audioTrackType ?? TrackType.Microphone);
  // this is just a workaround for rules of hooks and conditionals :(
  if (!state.widgetState.videoTrackType) {
    videoTrack = null;
  }
  if (!state.widgetState.audioTrackType) {
    audioTrack = null;
  }

  const isSharingAudio = !!audioTrack;

  const streamType = inferStreamType(state.widgetState);

  const stopStreaming = React.useCallback(() => {
    // can only stop your own device's stream
    if (!isLocalDeviceStream) return;

    // figure out which streams to stop
    if (streamType === 'screen') {
      media.stopScreenShare();
    } else {
      media.stopCamera();
      media.stopMicrophone();
    }

    onClose();
  }, [streamType, isLocalDeviceStream, onClose]);

  const hasAnyMedia = !!videoTrack || !!audioTrack;

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
      color={ThemeName.VintageInk}
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
        {!!isConnected && (
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
      <WidgetContent disablePadding className={classes.background}>
        <FullscreenableMedia
          className={classes.screenShare}
          isFullscreen={isFullscreen}
          onFullscreenExit={onExitFullscreen}
          muted={isLocalMuted}
          videoTrack={videoTrack}
          audioTrack={audioTrack}
        />
        <WidgetResizeHandle />
      </WidgetContent>
    </WidgetFrame>
  );
};
