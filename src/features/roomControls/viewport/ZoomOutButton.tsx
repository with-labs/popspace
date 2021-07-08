import { MinusIcon } from '@components/icons/MinusIcon';
import { IconButton } from '@material-ui/core';
import { useViewport } from '@providers/viewport/useViewport';
import { roundTenths } from '@utils/math';
import { ZOOM_INCREMENT } from './constants';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';

export function ZoomOutButton() {
  const viewport = useViewport();

  const handleZoomOut = () => {
    Analytics.trackEvent(EventNames.BUTTON_CLICKED, 'zoom_out');

    viewport.doZoom(roundTenths(viewport.zoom - ZOOM_INCREMENT), {
      origin: 'control',
    });
  };

  return (
    <IconButton onClick={handleZoomOut} aria-label="zoom in" size="small">
      <MinusIcon aria-hidden fontSize="default" />
    </IconButton>
  );
}
