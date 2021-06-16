import * as React from 'react';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetFrame } from '../../WidgetFrame';
import { IFrameDocumentContent } from './IFrameDocumentContent';
import { ThemeName } from '../../../../../theme/theme';
import { MAX_SIZE_FRAME, SIZE_STUB } from '../constants';

export function DocumentLinkWidget() {
  const {
    widget: { widgetState },
    save,
  } = useWidgetContext<WidgetType.Link>();

  const getUrl = async (url: string) => {
    return await fetch(url).then((response) => response.text());
  };

  // disable sandbox for PDFs specifically, it breaks in Chrome
  const isPDF = widgetState.mediaContentType === 'application/pdf';

  //calling fetch here to set the value of resizeDisabled
  React.useEffect(() => {
    if (!widgetState.embedly) {
      getUrl('https://api.embedly.com/1/oembed?url=' + widgetState.url + '&key=ba3b50015d8245539b3ca12286d8970a').then(
        (response) => {
          //fetching data from embedly API
          let res = JSON.parse(response);
          save({
            embedly: res,
          });
        }
      );
    }
  }, [isPDF, save, widgetState.embedly, widgetState.iframeUrl, widgetState.url]);

  if (widgetState.embedly) {
    return (
      <WidgetFrame
        color={ThemeName.Snow}
        minWidth={SIZE_STUB.width}
        minHeight={SIZE_STUB.height}
        maxWidth={MAX_SIZE_FRAME.width}
        maxHeight={MAX_SIZE_FRAME.height}
        resizeDisabled={!widgetState.embedly.html && !widgetState.iframeUrl}
      >
        <IFrameDocumentContent
          disableSandbox={isPDF}
          data={widgetState.embedly}
          goodResponse={
            !!widgetState.iframeUrl || (widgetState.embedly.type !== 'error' && widgetState.embedly.type !== '')
          }
        />
      </WidgetFrame>
    );
  } else {
    return null;
  }
}
