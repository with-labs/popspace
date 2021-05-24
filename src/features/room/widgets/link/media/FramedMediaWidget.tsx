import * as React from 'react';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { WidgetFrame } from '../../WidgetFrame';
import { WidgetTitlebar } from '../../WidgetTitlebar';
import { LinkMenu } from '../menu/LinkMenu';
import { MediaLinkMedia } from './MediaWidgetMedia';
import { ThemeName } from '../../../../../theme/theme';
import { MAX_SIZE_FRAME_MEDIA, MIN_SIZE_FRAME_MEDIA } from '../constants';

export const FramedMediaWidget = () => {
  const {
    widget: { widgetState: data, widgetId },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={MIN_SIZE_FRAME_MEDIA.width}
      minHeight={MIN_SIZE_FRAME_MEDIA.height}
      maxWidth={MAX_SIZE_FRAME_MEDIA.width}
      maxHeight={MAX_SIZE_FRAME_MEDIA.height}
    >
      <WidgetTitlebar title={data.title} disableRemove>
        <LinkMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <MediaLinkMedia widgetId={widgetId} />
      </WidgetContent>
    </WidgetFrame>
  );
};
