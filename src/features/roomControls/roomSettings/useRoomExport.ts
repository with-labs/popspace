import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { createSelector } from '@reduxjs/toolkit';
import { ObjectPositionData } from '../../room/roomSlice';

const exportableStateSelector = createSelector(
  (state: RootState) => state.room,
  (room) => {
    // omit people and their positions
    const { positions, widgets, people: _omitted, ...rest } = room;
    const newPositions = Object.keys(widgets).reduce((acc, widgetId) => {
      acc[widgetId] = positions[widgetId];
      return acc;
    }, {} as Record<string, ObjectPositionData>);
    return {
      ...rest,
      widgets,
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
