import * as React from 'react';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetType } from '@roomState/types/widgets';
import { FullSizeMediaWidget } from './FullSizeMediaWidget';
import { FramedMediaWidget } from './FramedMediaWidget';

export interface IMediaLinkWidgetProps {}

/**
 * A different rendering mode for LinkWidget, focused on displaying
 * a piece of media using the full content frame, with resizing
 */
export const MediaLinkWidget: React.FC<IMediaLinkWidgetProps> = () => {
  const {
    widget: { widgetState: data },
  } = useWidgetContext<WidgetType.Link>();

  if (
    data.mediaContentType &&
    (data.mediaContentType.startsWith('video') || data.mediaContentType.startsWith('image'))
  ) {
    return <FullSizeMediaWidget />;
  }

  return <FramedMediaWidget />;
};
