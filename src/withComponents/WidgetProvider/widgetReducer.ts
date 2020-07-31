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
        [payload.id]: {
          ...state[payload.id],
          location: payload.location,
        },
      };

      return newWidgets;
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

export const widgetLocationUpdate = (id: string, location: LocationTuple) => ({
  type: Actions.WidgetLocationUpdate,
  payload: { id, location },
});
