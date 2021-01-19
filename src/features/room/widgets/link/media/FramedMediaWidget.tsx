import * as React from 'react';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { WidgetFrame } from '../../WidgetFrame';
import { WidgetTitlebar } from '../../WidgetTitlebar';
import { LinkMenu } from '../menu/LinkMenu';
import { MediaLinkMedia } from './MediaWidgetMedia';

export const FramedMediaWidget = () => {
  const {
    widget: { widgetState: data, widgetId },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <WidgetFrame color="snow">
      <WidgetTitlebar title={data.title} disableRemove>
        <LinkMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <MediaLinkMedia widgetId={widgetId} />
      </WidgetContent>
    </WidgetFrame>
  );
};
