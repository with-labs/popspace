import * as React from 'react';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';

import { StubLinkWidget } from './StubLinkWidget';
import { SummaryLinkWidget } from './SummaryLinkWidget';
import { EmbedlyHtmlLinkWidget } from './EmbedlyHtmlLinkWidget';
import { IFrameLinkWidget } from './IFrameLinkWidget';

export function DocumentLinkWidget() {
  const {
    widget: { widgetState, widgetId },
    save,
  } = useWidgetContext<WidgetType.Link>();

  const getUrl = async (url: string) => {
    return await fetch(url).then((response) => response.text());
  };

  //calling fetch here to set the value of resizeDisabled
  React.useEffect(() => {
    if (!widgetState.embedly) {
      getUrl('https://api.embedly.com/1/oembed?url=' + widgetState.url + '&key=ba3b50015d8245539b3ca12286d8970a').then(
        (response) => {
          //fetching data from embedly API
          const res = JSON.parse(response);
          save({
            embedly: res,
          });
        }
      );
    }
  }, [save, widgetState.embedly, widgetState.iframeUrl, widgetState.url]);

  const noPreview = !widgetState.iframeUrl && (widgetState.embedly?.type === 'error' || !widgetState.embedly?.type);

  if (noPreview) {
    return <StubLinkWidget />;
  }

  if (widgetState.embedly && !widgetState.embedly.html && !widgetState.iframeUrl) {
    return <SummaryLinkWidget />;
  }

  if (widgetState.embedly?.html) {
    return <EmbedlyHtmlLinkWidget />;
  }

  if (widgetState.iframeUrl) {
    return <IFrameLinkWidget />;
  }

  return null;
}
