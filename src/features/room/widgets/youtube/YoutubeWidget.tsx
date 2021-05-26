import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditYoutubeWidgetForm } from './EditYoutubeWidgetForm';
import { MuteButton } from '../MuteButton';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { YouTubePlayer } from './YouTubePlayer';
import { useCurrentUserProfile } from '@hooks/api/useCurrentUserProfile';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetType } from '@roomState/types/widgets';
import { ThemeName } from '../../../../theme/theme';
import { MAX_SIZE_PLAYER, MIN_SIZE_PLAYER, SIZE_EDIT } from './constants';

export interface IYoutubeWidgetProps {}

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
  resizeHandle: {
    // BUGFIX: chromium #1068474, layers are composited incorrectly with iframe/canvas and the controls are
    // hidden beneath the video despite being above it
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1068474&q=overflow%20hidden%20scale&can=2
    // will-change: top fixes this behavior as a hack.
    willChange: 'top',
  },
  formContent: {
    width: '100%',
    height: '100%',
  },
}));

export const YoutubeWidget: React.FC<IYoutubeWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { widget: state } = useWidgetContext<WidgetType.YouTube>();

  const { user } = useCurrentUserProfile();
  const localUserId = user?.id;

  const saveWidget = useSaveWidget(state.widgetId);

  const [isMuted, setIsMuted] = React.useState(false);
  const toggleMuted = () => setIsMuted((v) => !v);

  const isPlaying = !!state.widgetState.mediaState?.isPlaying;

  if (!state.widgetState.videoId) {
    if (state.ownerId === localUserId) {
      return (
        <WidgetFrame
          color={ThemeName.Cherry}
          minWidth={SIZE_EDIT.width}
          minHeight={SIZE_EDIT.height}
          maxWidth={SIZE_EDIT.width}
          maxHeight={SIZE_EDIT.height}
          resizeDisabled
        >
          <WidgetTitlebar title={t('widgets.youtube.title')} />
          <WidgetContent className={classes.formContent}>
            <EditYoutubeWidgetForm onSave={saveWidget} />
          </WidgetContent>
        </WidgetFrame>
      );
    } else {
      // somebody else made this but the video ID is not defined yet (i.e. they haven't pasted a URL in yet)
      // don't show it.
      return null;
    }
  }

  return (
    <WidgetFrame
      color={ThemeName.Cherry}
      minWidth={MIN_SIZE_PLAYER.width}
      minHeight={MIN_SIZE_PLAYER.height}
      maxWidth={MAX_SIZE_PLAYER.width}
      maxHeight={MAX_SIZE_PLAYER.height}
      preserveAspect
    >
      <WidgetTitlebar title={t('widgets.youtube.title')}>
        <MuteButton isPlaying={isPlaying} isMuted={isMuted} onClick={toggleMuted} />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <YouTubePlayer state={state} onChange={saveWidget} isMuted={isMuted} />
        <WidgetResizeHandle className={classes.resizeHandle} />
      </WidgetContent>
    </WidgetFrame>
  );
};
