import { WidgetType } from '../types/room';

export const MIN_WIDGET_WIDTH = 160;
export const MIN_WIDGET_HEIGHT = 98;

export const WIDGET_SIZE_RESTRICTIONS: Record<WidgetType, { minWidth: number; minHeight: number }> = {
  [WidgetType.Link]: {
    minWidth: 250,
    minHeight: 98,
  },
  [WidgetType.StickyNote]: {
    minWidth: 250,
    minHeight: 200,
  },
  [WidgetType.Whiteboard]: {
    minWidth: 720,
    minHeight: 480,
  },
  [WidgetType.YouTube]: {
    minWidth: 300,
    minHeight: 200,
  },
};
