import { Action } from '../RoomState/RoomStateProvider';
import { EmojiData as ED } from 'emoji-mart';

export type LocationTuple = [number, number];
export type EmojiData = ED | null | string;

export interface IParticipantMeta {
  location: LocationTuple;
  emoji: EmojiData;
}

// The key is a participant's sid
export interface IParticipantMetaState {
  [key: string]: IParticipantMeta;
}

enum Actions {
  UpdateLocation = 'UPDATE_LOCATION',
  UpdateEmoji = 'UPDATE_EMOJI',
}

export default function reducer(state: IParticipantMetaState = {}, action: Action) {
  const { type, payload } = action;

  switch (type) {
    case Actions.UpdateLocation: {
      const newPts = { ...state, [payload.sid]: { ...state[payload.sid], location: payload.location } };

      return newPts;
    }

    case Actions.UpdateEmoji: {
      const newPts = { ...state, [payload.sid]: { ...state[payload.sid], emoji: payload.emoji } };

      return newPts;
    }
  }

  return state;
}

export const locationUpdate = (sid: string, location: LocationTuple) => ({
  type: Actions.UpdateLocation,
  payload: { sid, location },
});

export const emojiUpdate = (sid: string, emoji: EmojiData) => ({
  type: Actions.UpdateEmoji,
  payload: { sid, emoji },
});
