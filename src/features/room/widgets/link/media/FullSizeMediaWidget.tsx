import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useResizeContext } from '../../../../../components/ResizeContainer/ResizeContainer';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { clampSizeMaintainingRatio } from '../../../../../utils/clampSizeMaintainingRatio';
import { DraggableHandle } from '../../../DraggableHandle';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { WidgetFrame } from '../../WidgetFrame';
import { WidgetResizeContainer } from '../../WidgetResizeContainer';
import { WidgetResizeHandle } from '../../WidgetResizeHandle';
import { LinkMenu } from '../menu/LinkMenu';
import { MediaLinkMedia } from './MediaWidgetMedia';

// when a media widget is first added, it will shoot for native
// size but stop at this limit. The user can still resize it larger afterward.
const INITIAL_MAX_SIZE = 800;

const useStyles = makeStyles((theme) => ({
  media: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    display: 'block',
    '&:focus': {
      outline: 'none',
      boxShadow: theme.focusRings.primary,
    },
    'audio&': {
      height: '100%',
    },
  },
  menu: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    // BUGFIX: chromium #1068474, layers are composited incorrectly with iframe/canvas and the controls are
    // hidden beneath the video despite being above it
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1068474&q=overflow%20hidden%20scale&can=2
    // will-change: top fixes this behavior as a hack.
    willChange: 'top',
  },
}));

/**
 * The kind of media widget that shows an image or video
 * edge-to-edge. It's resizeable.
 */
export const FullSizeMediaWidget: React.FC = () => (
  <WidgetFrame color={'transparent'}>
    <DraggableHandle>
      <WidgetContent disablePadding>
        <WidgetResizeContainer mode="scale" minWidth={100} minHeight={54} disableInitialSizing>
          <FullSizeMediaWidgetContent />
        </WidgetResizeContainer>
      </WidgetContent>
    </DraggableHandle>
  </WidgetFrame>
);

const FullSizeMediaWidgetContent: React.FC = () => {
  const classes = useStyles();
  const {
    widget: { widgetId },
  } = useWidgetContext<WidgetType.Link>();

  const { remeasure, size } = useResizeContext();

  const ref = React.useRef<HTMLVideoElement | HTMLImageElement>(null);

  // if a size hasn't been measured yet, wait for the content to load and
  // measure it
  React.useEffect(() => {
    if (ref.current && !size) {
      const el = ref.current;

      // when metadata is loaded, we attempt to resize the ResizeContainer
      // to the natural size of the media
      function doRemeasure() {
        const naturalSize =
          el.tagName === 'IMG'
            ? {
                width: (el as HTMLImageElement).naturalWidth,
                height: (el as HTMLImageElement).naturalHeight,
              }
            : {
                width: (el as HTMLVideoElement).videoWidth,
                height: (el as HTMLVideoElement).videoHeight,
              };

        remeasure(
          clampSizeMaintainingRatio({
            width: naturalSize.width,
            height: naturalSize.height,
            maxWidth: INITIAL_MAX_SIZE,
            maxHeight: INITIAL_MAX_SIZE,
          })
        );
      }
      el.addEventListener('resize', doRemeasure);
      el.addEventListener('load', doRemeasure);
      return () => {
        el.removeEventListener('resize', doRemeasure);
        el.removeEventListener('load', doRemeasure);
      };
    }
  }, [remeasure, size]);

  return (
    <>
      <MediaLinkMedia className={classes.media} widgetId={widgetId} ref={ref} />
      <LinkMenu className={classes.menu} size="small" />
      <WidgetResizeHandle />
    </>
  );
};
