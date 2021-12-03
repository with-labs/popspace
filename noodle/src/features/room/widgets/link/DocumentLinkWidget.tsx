import { WidgetType } from '@api/roomState/types/widgets';
import { Box, CircularProgress } from '@material-ui/core';
import * as React from 'react';

import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { IFrameLinkWidget } from './IFrameLinkWidget';
import { StubLinkWidget } from './StubLinkWidget';

export function DocumentLinkWidget() {
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  if (widgetState.iframeUrl && widgetState.showIframe) {
    return <IFrameLinkWidget />;
  }

  return (
    <StubLinkWidget
      url={widgetState.url}
      title={widgetState.title}
      iconUrl={widgetState.iconUrl}
      enableIframe={!!widgetState.iframeUrl}
    />
  );
}

const DocumentWidgetSpinner = () => (
  <WidgetFrame resizeDisabled>
    <WidgetContent disablePadding>
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    </WidgetContent>
  </WidgetFrame>
);
