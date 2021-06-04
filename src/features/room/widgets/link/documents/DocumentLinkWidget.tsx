import * as React from 'react';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetFrame } from '../../WidgetFrame';
import { IFrameDocumentContent } from './IFrameDocumentContent';
import { ThemeName } from '../../../../../theme/theme';
import { MAX_SIZE_FRAME, SIZE_STUB } from '../constants';

export function DocumentLinkWidget() {
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  const [iframable, setIframable] = React.useState(false);
  const [data, setData] = React.useState({
    provider_name: '',
    title: '',
    html: '',
    url: '',
    description: '',
    provider_url: '',
    thumbnail_url: '',
    thumbnail_width: 0,
    thumbnail_height: 0,
    type: '',
  });

  const getUrl = async (url: string) => {
    return await fetch(url).then((response) => response.text());
  };

  // disable sandbox for PDFs specifically, it breaks in Chrome
  const isPDF = widgetState.mediaContentType === 'application/pdf';

  //calling fetch here to set the value of resizeDisabled
  React.useEffect(() => {
    getUrl('https://api.embedly.com/1/oembed?url=' + widgetState.url + '&key=ba3b50015d8245539b3ca12286d8970a').then(
      (response) => {
        //fetching data from embedly API
        let res = JSON.parse(response);
        if (!!res.html || !!widgetState.iframeUrl) {
          setIframable(true);
        } else {
          setIframable(false);
        }
        setData((data) => {
          return { ...data, ...res };
        });
      }
    );
  }, [iframable, isPDF, widgetState, widgetState.iframeUrl, widgetState.url]);

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={SIZE_STUB.width}
      minHeight={SIZE_STUB.height}
      maxWidth={MAX_SIZE_FRAME.width}
      maxHeight={MAX_SIZE_FRAME.height}
      resizeDisabled={!(widgetState.showIframe || iframable)}
    >
      <IFrameDocumentContent
        disableSandbox={isPDF}
        data={data}
        goodResponse={!!widgetState.iframeUrl || (data.type !== 'error' && data.type !== '')}
      />
    </WidgetFrame>
  );
}
