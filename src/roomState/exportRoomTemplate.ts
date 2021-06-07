import { RoomDetailsStateShape, RoomPositionState } from './types/common';
import { WidgetState, WidgetType } from './types/widgets';
import { RoomStateShape } from './useRoomStore';

// we need to generate new widget IDs or owners when we create a new room,
// hence the change in format - we don't store ID data or key on it, and
// the new owner will be whoever created from the template.
// so, we store widget contents and positions as tuples
export type WidgetTemplateTuple = [WidgetType, WidgetState, RoomPositionState];

export interface RoomTemplate {
  widgets: WidgetTemplateTuple[];
  state: Omit<RoomDetailsStateShape, 'zOrder'>;
}

/**
 * Exports the current room state as a template JSON file which can be
 * used to populate the initial contents of a new room. Currently used as a
 * dev tool to create templates which are then hardcoded back into the client
 * for room creation flows.
 */
export function exportRoomTemplate(roomState: RoomStateShape): RoomTemplate {
  // only certain parts of state are added to a template; namely
  // background, size, widgets
  const { state: rawState, widgets, widgetPositions } = roomState;
  const { zOrder: _, ...state } = rawState;

  return {
    state,
    widgets: Object.entries(widgets).map(([id, widgetShape]) => [
      widgetShape.type,
      widgetShape.widgetState,
      widgetPositions[id],
    ]),
  };
}
