import { useCallback } from 'react';

import {
  widgetAdd,
  widgetRemove,
  widgetLocationUpdate,
  widgetDataUpdate,
  widgetDataFieldUpdate,
} from '../../withComponents/WidgetProvider/widgetReducer';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';
import { useRoomStateContext } from '../useRoomStateContext/useRoomStateContext';
import { v4 as uuid } from 'uuid';
import { LocationTuple } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../withComponents/RoomState/store';

export function useWidgetContext() {
  const widgets = useSelector((state: RootState) => state.widgets);
  const { dispatch } = useRoomStateContext();

  // Mutator to add a widget.
  const addWidget = useCallback(
    (type: WidgetTypes, participantSid: string, data: any) => {
      const widget = {
        id: uuid(),
        type,
        participantSid,
        // data holds the specific data needed for each type of widget
        data,
      };

      dispatch(widgetAdd(widget));
    },
    [dispatch]
  );

  // Mutator to remove a widget.
  const removeWidget = useCallback(
    (widgetId: string) => {
      dispatch(widgetRemove(widgetId));
    },
    [dispatch]
  );

  // update the location of a widget
  const updateWidgetLocation = useCallback(
    (widgetId: string, location: LocationTuple) => {
      dispatch(widgetLocationUpdate(widgetId, location));
    },
    [dispatch]
  );

  const updateWidgetData = useCallback(
    (widgetId: string, data: object) => {
      dispatch(widgetDataUpdate(widgetId, data));
    },
    [dispatch]
  );

  const updateWidgetDataField = useCallback(
    (widgetId: string, field: string, value: any) => {
      dispatch(widgetDataFieldUpdate(widgetId, field, value));
    },
    [dispatch]
  );

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidgetLocation,
    updateWidgetData,
    updateWidgetDataField,
  };
}
