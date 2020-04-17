import { Action } from '../RoomState/RoomStateProvider';

export type LocationTuple = [number, number];

export interface IParticipantMeta {
  location: LocationTuple;
  presence: string; // Placeholder for when we implement an emoji "status" thing.
}

export interface IParticipantMetaState {
  [key: string]: IParticipantMeta;
}

enum Actions {
  UpdateLocation = 'UPDATE_LOCATION',
  UpdatePresence = 'UPDATE_PRESENCE',
}

export default function reducer(state: IParticipantMetaState = {}, action: Action) {
  const { type, payload } = action;

  switch (type) {
    case Actions.UpdateLocation: {
      const newPts = { ...state, [payload.sid]: { ...state[payload.sid], location: payload.location } };

      return newPts;
    }

    case Actions.UpdatePresence: {
      const newPts = { ...state, [payload.sid]: { ...state[payload.sid], presence: payload.presence } };

      return newPts;
    }
  }

  return state;
}

export const locationUpdate = (sid: string, location: LocationTuple) => ({
  type: Actions.UpdateLocation,
  payload: { sid, location },
});

export const presenceUpdate = (sid: string, presence: string) => ({
  type: Actions.UpdatePresence,
  payload: { sid, presence },
});
