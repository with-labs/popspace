import { RoomDetailsStateShape, RoomPositionState } from './types/common';
import { WidgetShape, WidgetState, WidgetType } from './types/widgets';
import { RoomStateShape } from '@api/useRoomStore';
import { notepadRegistry } from '@features/room/widgets/notepad/notepadRegistry';

// we need to generate new widget IDs or owners when we create a new room,
// hence the change in format - we don't store ID data or key on it, and
// the new owner will be whoever created from the template.
// so, we store widget contents and positions as tuples
export type WidgetTemplateTuple = [WidgetType, WidgetState, RoomPositionState];

export interface RoomTemplate {
  widgets: WidgetTemplateTuple[];
  state: Omit<RoomDetailsStateShape, 'zOrder'>;
  displayName: string;
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
  const { state: rawState, widgets, widgetPositions, displayName } = roomState;
  const { zOrder: _, ...state } = rawState;

  return {
    state,
    displayName,
    widgets: Object.entries(widgets).map(([id, widgetShape]) => [
      widgetShape.type,
      getWidgetState(widgetShape),
      widgetPositions[id],
    ]),
  };
}

function getWidgetState(widgetShape: WidgetShape): WidgetState {
  if (widgetShape.type === WidgetType.Notepad) {
    return {
      ...widgetShape.widgetState,
      initialData: notepadRegistry.quills[widgetShape.widgetId]?.getContents()?.ops || null,
    };
  }
  return widgetShape.widgetState;
}
