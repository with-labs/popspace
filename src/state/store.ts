import { configureStore, combineReducers, Action } from '@reduxjs/toolkit';
import { reducer as roomReducer } from '../features/room/roomSlice';
import { reducer as preferencesReducer } from '../features/preferences/preferencesSlice';
import * as Sentry from '@sentry/react';

const appReducer = combineReducers({
  room: roomReducer,
  preferences: preferencesReducer,
  __unsafe: (state: { receivedPing: boolean } = { receivedPing: false }, action: Action) => {
    if (action.type === 'PING') {
      return { receivedPing: true };
    }
    return state;
  },
});
export type RootState = ReturnType<typeof appReducer>;

// This is a technique to replace the state of the Redux store state as seen here:
// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store/35641992#35641992
// On a PING, we want to replace the state, since that will be like the initial state for a newly entered participant.
const rootReducer = (state: RootState | undefined, action: any) => {
  if (action.type === 'PING' && !state?.__unsafe.receivedPing) {
    return {
      ...action.payload.state,
      // keep preferences intact - we don't want the initial PING to remove them
      // FIXME: this is hacky, we should maybe write a holistic Redux middleware or change our approach.
      preferences: state?.preferences,
      __unsafe: {
        receivedPing: true,
      },
    } as RootState;
  }

  return appReducer(state, action);
};

const sentryEnhancer = Sentry.createReduxEnhancer();

const store = configureStore({
  reducer: rootReducer,
  enhancers: [sentryEnhancer],
  devTools: true,
});

export default store;
