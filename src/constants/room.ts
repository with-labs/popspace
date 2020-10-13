import { WidgetType } from '../types/room';

export const MIN_WIDGET_WIDTH = 160;
export const MIN_WIDGET_HEIGHT = 98;

export const WIDGET_SIZE_RESTRICTIONS: Record<
  WidgetType,
  { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number }
> = {
  [WidgetType.Link]: {
    minWidth: 250,
    minHeight: 98,
    maxWidth: 600,
    maxHeight: 400,
  },
  [WidgetType.StickyNote]: {
    minWidth: 250,
    minHeight: 200,
    maxWidth: 600,
    maxHeight: 600,
  },
  [WidgetType.Whiteboard]: {
    minWidth: 720,
    minHeight: 480,
    maxWidth: 1000,
    maxHeight: 1000,
  },
  [WidgetType.YouTube]: {
    minWidth: 300,
    minHeight: 200,
    maxWidth: 1200,
    maxHeight: 1000,
  },
};
