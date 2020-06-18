import { Action } from '../RoomState/RoomStateProvider';

import { BackgroundName } from '../BackgroundPicker/options';

// `IWidgetState` is the state maintained by this context provider representing the widgets present in the room.
export interface IRoomMetaState {
  [key: string]: string;
}

enum Actions {
  PropertySet = 'PROPERTY_SET',
  PropertiesSet = 'PROPERTIES_SET',
  PropertyUnset = 'PROPERTY_UNSET',
}

export default function reducer(
  state: IRoomMetaState = { bg: BackgroundName.Bg3, spatialAudio: 'on' },
  action: Action
) {
  const { type, payload } = action;

  switch (type) {
    case Actions.PropertySet: {
      const newProps = { ...state };
      newProps[payload.key] = payload.value;

      return newProps;
    }

    case Actions.PropertiesSet: {
      const newProps = { ...state, ...payload };

      return newProps;
    }

    case Actions.PropertyUnset: {
      const newProps = { ...state };
      delete newProps[payload];

      return newProps;
    }
  }

  return state;
}

export const propertySet = (key: string, value: string) => ({
  type: Actions.PropertySet,
  payload: { key, value },
});

export const propertiesSet = (props: { [key: string]: string }) => ({
  type: Actions.PropertiesSet,
  payload: props,
});

export const propertyUnset = (key: string) => ({
  type: Actions.PropertyUnset,
  payload: key,
});
