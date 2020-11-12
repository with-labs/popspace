import { configureStore, combineReducers, Action } from '@reduxjs/toolkit';
import { reducer as roomReducer, actions as roomActions } from '../features/room/roomSlice';
import { reducer as preferencesReducer } from '../features/preferences/preferencesSlice';
import { reducer as roomControlsReducer } from '../features/roomControls/roomControlsSlice';
import * as Sentry from '@sentry/react';

const appReducer = combineReducers({
  room: roomReducer,
  preferences: preferencesReducer,
  roomControls: roomControlsReducer,
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
      ...state,
      ...action.payload.state,
      __unsafe: {
        receivedPing: true,
      },
    } as RootState;
  } else if (action.type === roomActions.leave.type && state?.__unsafe.receivedPing) {
    // when leaving a room we have to reset the receivedPing...
    return appReducer(
      {
        ...state,
        __unsafe: {
          receivedPing: false,
        },
      },
      action
    );
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
