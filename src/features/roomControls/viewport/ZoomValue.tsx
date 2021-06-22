import { useViewport } from '@providers/viewport/useViewport';
import * as React from 'react';
import throttle from 'lodash.throttle';
import { Typography } from '@material-ui/core';

export function ZoomValue() {
  const viewport = useViewport();

  const [zoomValue, setZoomValue] = React.useState(viewport.zoom);

  React.useEffect(() => {
    function updateZoom() {
      setZoomValue(viewport.zoom);
    }
    const throttledUpdateZoom = throttle(updateZoom, 300, { trailing: true });

    viewport.on('zoomChanged', throttledUpdateZoom);
    return () => {
      viewport.off('zoomChanged', throttledUpdateZoom);
    };
  }, [viewport]);

  return (
    <Typography variant="button" style={{ width: 50 }} align="center">{`${Math.floor(zoomValue * 100)}%`}</Typography>
  );
}
