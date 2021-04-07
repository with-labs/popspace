import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditYoutubeWidgetForm } from './EditYoutubeWidgetForm';
import { MuteButton } from '../MuteButton';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { YouTubePlayer } from './YouTubePlayer';
import { useCurrentUserProfile } from '../../../../hooks/api/useCurrentUserProfile';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useIsAway } from '../../../roomControls/away/useIsAway';
import { ThemeName } from '../../../../theme/theme';

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
  const [isAway] = useIsAway();

  const isPlaying = !!state.widgetState.mediaState?.isPlaying;

  if (!state.widgetState.videoId) {
    if (state.ownerId === localUserId) {
      return (
        <WidgetFrame color={ThemeName.Cherry}>
          <WidgetTitlebar title={t('widgets.youtube.title')} />
          <WidgetContent>
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

  const finalMuted = isMuted || isAway;

  return (
    <WidgetFrame color={ThemeName.Cherry}>
      <WidgetTitlebar title={t('widgets.youtube.title')}>
        <MuteButton isPlaying={isPlaying} isMuted={finalMuted} onClick={toggleMuted} />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <WidgetResizeContainer
          minWidth={480}
          minHeight={270}
          maxWidth={1440}
          maxHeight={900}
          className={classes.videoContainer}
          mode="scale"
        >
          <YouTubePlayer state={state} onChange={saveWidget} isMuted={finalMuted} />
          <WidgetResizeHandle className={classes.resizeHandle} />
        </WidgetResizeContainer>
      </WidgetContent>
    </WidgetFrame>
  );
};
