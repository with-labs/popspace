import { configureStore, combineReducers, AnyAction } from '@reduxjs/toolkit';
import { reducer as roomReducer } from '../features/room/roomSlice';
import { reducer as roomControlsReducer } from '../features/roomControls/roomControlsSlice';
import * as Sentry from '@sentry/react';

const appReducer = combineReducers({
  room: roomReducer,
  roomControls: roomControlsReducer,
});
export type RootState = ReturnType<typeof appReducer>;

// filter for what redux actions we log to sentry
const reduxActionFilter = (action: AnyAction) => {
  if (action.type === 'room/updatePersonIsSpeaking') {
    return null;
  }
  return action;
};

const sentryEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: reduxActionFilter,
});

const store = configureStore({
  reducer: appReducer,
  enhancers: [sentryEnhancer],
  devTools: true,
});

export default store;
