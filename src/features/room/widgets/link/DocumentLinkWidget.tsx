import { WidgetType } from '@api/roomState/types/widgets';
import { Box, CircularProgress } from '@material-ui/core';
import * as React from 'react';

import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { EmbedlyHtmlLinkWidget } from './EmbedlyHtmlLinkWidget';
import { IFrameLinkWidget } from './IFrameLinkWidget';
import { StubLinkWidget } from './StubLinkWidget';
import { EmbedlyResponse } from './types';

export function DocumentLinkWidget() {
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  //calling fetch here to set the value of resizeDisabled
  const [{ data: embedlyResponse, isLoading }, setEmbedlyResponse] = React.useState<{
    isLoading: boolean;
    data: EmbedlyResponse | null;
  }>({ isLoading: true, data: null });
  React.useEffect(() => {
    const controller = new AbortController();
    fetch('https://api.embedly.com/1/oembed?url=' + widgetState.url + '&key=ba3b50015d8245539b3ca12286d8970a', {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((body) => {
        setEmbedlyResponse({ isLoading: false, data: body });
      });

    return () => {
      controller.abort();
    };
  }, [widgetState.url]);

  if (isLoading) {
    return <DocumentWidgetSpinner />;
  }

  if (embedlyResponse?.html) {
    return <EmbedlyHtmlLinkWidget embedlyResponse={embedlyResponse} />;
  }

  if (widgetState.iframeUrl && widgetState.showIframe) {
    return <IFrameLinkWidget />;
  }

  return (
    <StubLinkWidget
      url={embedlyResponse?.url ?? widgetState.url}
      title={embedlyResponse?.title ?? widgetState.title}
      iconUrl={embedlyResponse?.thumbnail_url ?? widgetState.iconUrl}
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
