import * as React from 'react';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetFrame } from '../../WidgetFrame';
import { IFrameDocumentContent } from './IFrameDocumentContent';
import { CollapsedDocumentContent } from './CollapsedDocumentContent';
import { ThemeName } from '../../../../../theme/theme';
import { MAX_SIZE_FRAME, SIZE_STUB } from '../constants';

export function DocumentLinkWidget() {
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  // disable sandbox for PDFs specifically, it breaks in Chrome
  const isPDF = widgetState.mediaContentType === 'application/pdf';

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={SIZE_STUB.width}
      minHeight={SIZE_STUB.height}
      maxWidth={MAX_SIZE_FRAME.width}
      maxHeight={MAX_SIZE_FRAME.height}
      resizeDisabled={!widgetState.showIframe}
    >
      {widgetState.showIframe ? <IFrameDocumentContent disableSandbox={isPDF} /> : <CollapsedDocumentContent />}
    </WidgetFrame>
  );
}
