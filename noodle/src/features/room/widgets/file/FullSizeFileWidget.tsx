import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import { WidgetType } from '@api/roomState/types/widgets';
import { clampSizeMaintainingRatio } from '@utils/clampSizeMaintainingRatio';
import { useWidgetContext } from '@features/room/widgets/useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { FileWidgetMenu } from './menu/FileWidgetMenu';
import { FileWidgetMedia } from './FileWidgetMedia';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { MAX_INITIAL_SIZE_MEDIA, MAX_SIZE_MEDIA, MIN_SIZE_MEDIA } from './constants';
import { compareWithTolerance } from '@utils/math';

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
export const FullSizeFileWidget: React.FC = () => {
  const classes = useStyles();

  return (
    <WidgetFrame
      color={'transparent'}
      minWidth={MIN_SIZE_MEDIA.width}
      minHeight={MIN_SIZE_MEDIA.height}
      maxWidth={MAX_SIZE_MEDIA.width}
      maxHeight={MAX_SIZE_MEDIA.height}
      preserveAspect
    >
      <CanvasObjectDragHandle>
        <WidgetContent disablePadding>
          <FullSizeFileWidgetContent />
        </WidgetContent>
        <FileWidgetMenu className={classes.menu} size="small" />
        <WidgetResizeHandle />
      </CanvasObjectDragHandle>
    </WidgetFrame>
  );
};

const FullSizeFileWidgetContent: React.FC = () => {
  const classes = useStyles();
  const {
    widget: { widgetId },
  } = useWidgetContext<WidgetType.File>();

  const { getSize, resize } = useCanvasObject();

  const ref = React.useRef<HTMLVideoElement | HTMLImageElement>(null);

  // if the media loads and the aspect ratio doesn't match the current size,
  // refit the size to match the native media aspect ratio.
  React.useEffect(() => {
    if (ref.current) {
      const el = ref.current;

      // when metadata is loaded, we attempt to resize the widget
      // to the natural aspect ratio of the media
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

        // sanity check
        if (naturalSize.width === 0 || naturalSize.height === 0) return;

        const widgetSize = getSize();
        const widgetAspectRatio = widgetSize.width / widgetSize.height;
        const naturalAspectRatio = naturalSize.width / naturalSize.height;

        // if aspect ratio doesn't match with 5% tolerance
        if (!compareWithTolerance(widgetAspectRatio, naturalAspectRatio, 0.05)) {
          resize(
            clampSizeMaintainingRatio({
              width: naturalSize.width,
              height: naturalSize.height,
              maxWidth: MAX_INITIAL_SIZE_MEDIA.width,
              maxHeight: MAX_INITIAL_SIZE_MEDIA.height,
              aspectRatio: naturalAspectRatio,
            }),
            true
          );
        }
      }
      el.addEventListener('resize', doRemeasure);
      el.addEventListener('load', doRemeasure);
      return () => {
        el.removeEventListener('resize', doRemeasure);
        el.removeEventListener('load', doRemeasure);
      };
    }
  }, [resize, getSize]);

  return <FileWidgetMedia className={classes.media} widgetId={widgetId} ref={ref} />;
};
