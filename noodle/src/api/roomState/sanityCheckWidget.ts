import { WidgetShape } from './types/widgets';

export function sanityCheckWidget(widget: WidgetShape) {
  return !!widget.widgetId && !!widget.type && !!widget.widgetState;
}
