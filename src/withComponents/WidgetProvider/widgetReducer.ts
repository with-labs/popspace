import { Action } from '../RoomState/RoomStateProvider';
import { WidgetTypes } from './widgetTypes';
import { LocationTuple } from '../../types';

// `IWidgetProperties` defines the properties that a widget must have.
export interface IWidgetProperties {
  type: WidgetTypes;
  id: string;
  participantSid: string;
  data: any;
  location?: LocationTuple;
}
// `IWidgetState` is the state maintained by this context provider representing the widgets present in the room.
export interface IWidgetState {
  [key: string]: IWidgetProperties;
}

enum Actions {
  WidgetAdd = 'WIDGET_ADD',
  WidgetRemove = 'WIDGET_REMOVE',
  WidgetLocationUpdate = 'WIDGET_LOCATION_UPDATE',
  WidgetUpdateData = 'WIDGET_DATA_UPDATE',
  WidgetDataFieldUpdate = 'WIDGET_DATA_FIELD_UPDATE',
}

export default function reducer(state: IWidgetState = {}, action: Action) {
  const { type, payload } = action;

  switch (type) {
    case Actions.WidgetAdd: {
      const newWidgets = { ...state };
      newWidgets[payload.id] = payload;

      return newWidgets;
    }

    case Actions.WidgetRemove: {
      const newWidgets = { ...state };
      delete newWidgets[payload];

      return newWidgets;
    }

    case Actions.WidgetLocationUpdate: {
      const newWidgets = {
        ...state,
        [payload.widgetId]: {
          ...state[payload.widgetId],
          location: payload.location,
        },
      };

      return newWidgets;
    }

    case Actions.WidgetUpdateData: {
      // this action just re-writes the entire widgetData
      const updatedWidgets = {
        ...state,
        [payload.widgetId]: {
          ...state[payload.widgetId],
          data: payload.data,
        },
      };

      return updatedWidgets;
    }

    case Actions.WidgetDataFieldUpdate: {
      const { widgetId, field, value } = payload;
      const updatedWidgets = {
        ...state,
        [widgetId]: {
          ...state[widgetId],
          data: {
            ...state[widgetId].data,
            [field]: value,
          },
        },
      };

      return updatedWidgets;
    }
  }

  return state;
}

export const widgetAdd = (widget: IWidgetProperties) => ({
  type: Actions.WidgetAdd,
  payload: widget,
});

export const widgetRemove = (widgetId: string) => ({
  type: Actions.WidgetRemove,
  payload: widgetId,
});

export const widgetLocationUpdate = (widgetId: string, location: LocationTuple) => ({
  type: Actions.WidgetLocationUpdate,
  payload: { widgetId, location },
});

export const widgetDataUpdate = (widgetId: string, data: object) => ({
  type: Actions.WidgetUpdateData,
  payload: { widgetId, data },
});

export const widgetDataFieldUpdate = (widgetId: string, field: string, value: any) => ({
  type: Actions.WidgetDataFieldUpdate,
  payload: { widgetId, field, value },
});
