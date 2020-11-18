import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { createSelector } from '@reduxjs/toolkit';
import { ObjectPositionData } from '../../room/roomSlice';
import { WidgetState } from '../../../types/room';

const exportableStateSelector = createSelector(
  (state: RootState) => state.room,
  (room) => {
    // omit people and their positions, and draft widgets.
    const { positions, widgets, people: _omitted, ...rest } = room;
    const newWidgets = Object.entries(widgets).reduce((acc, [id, state]) => {
      if (state.isDraft) return acc;
      acc[id] = state;
      return acc;
    }, {} as Record<string, WidgetState>);
    const newPositions = Object.keys(newWidgets).reduce((acc, widgetId) => {
      acc[widgetId] = positions[widgetId];
      return acc;
    }, {} as Record<string, ObjectPositionData>);
    return {
      ...rest,
      widgets: newWidgets,
      positions: newPositions,
    };
  }
);

/**
 * Returns a snapshot of the current state, ready for exporting to file.
 */
export function useRoomExport() {
  return useSelector(exportableStateSelector);
}
