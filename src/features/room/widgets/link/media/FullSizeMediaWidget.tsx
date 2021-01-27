import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useResizeContext } from '../../../../../components/ResizeContainer/ResizeContainer';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { DraggableHandle } from '../../../DraggableHandle';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { WidgetFrame } from '../../WidgetFrame';
import { WidgetResizeContainer } from '../../WidgetResizeContainer';
import { WidgetResizeHandle } from '../../WidgetResizeHandle';
import { LinkMenu } from '../menu/LinkMenu';
import { MediaLinkMedia } from './MediaWidgetMedia';

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
  <WidgetFrame color="snow">
    <DraggableHandle>
      <WidgetContent disablePadding>
        <WidgetResizeContainer
          mode="scale"
          minWidth={340}
          minHeight={54}
          maxWidth={1440}
          maxHeight={900}
          disableInitialSizing
        >
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
      el.addEventListener('resize', remeasure);
      el.addEventListener('load', remeasure);
      return () => {
        el.removeEventListener('resize', remeasure);
        el.removeEventListener('load', remeasure);
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
