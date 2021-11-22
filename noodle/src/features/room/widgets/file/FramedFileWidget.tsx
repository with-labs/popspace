import * as React from 'react';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { FileWidgetMenu } from './menu/FileWidgetMenu';
import { FileWidgetMedia } from './FileWidgetMedia';
import { ThemeName } from '@src/theme/theme';
import { MAX_SIZE_FRAME_MEDIA, MIN_SIZE_FRAME_MEDIA } from './constants';

export const FramedFileWidget = () => {
  const {
    widget: { widgetState: data, widgetId },
  } = useWidgetContext<WidgetType.File>();

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={MIN_SIZE_FRAME_MEDIA.width}
      minHeight={MIN_SIZE_FRAME_MEDIA.height}
      maxWidth={MAX_SIZE_FRAME_MEDIA.width}
      maxHeight={MAX_SIZE_FRAME_MEDIA.height}
    >
      <WidgetTitlebar title={data.fileName} disableRemove>
        <FileWidgetMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <FileWidgetMedia widgetId={widgetId} />
      </WidgetContent>
    </WidgetFrame>
  );
};
