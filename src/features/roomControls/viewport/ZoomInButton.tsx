import { PlusIcon } from '@components/icons/PlusIcon';
import { IconButton } from '@material-ui/core';
import { useViewport } from '@providers/viewport/useViewport';
import { roundTenths } from '@utils/math';
import { ZOOM_INCREMENT } from './constants';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';

export function ZoomInButton() {
  const viewport = useViewport();

  const handleZoomIn = () => {
    Analytics.trackEvent(EventNames.BUTTON_CLICKED, 'zoom_in');
    viewport.doZoom(roundTenths(viewport.zoom + ZOOM_INCREMENT), {
      origin: 'control',
    });
  };

  return (
    <IconButton onClick={handleZoomIn} aria-label="zoom in" size="small">
      <PlusIcon aria-hidden fontSize="default" />
    </IconButton>
  );
}
