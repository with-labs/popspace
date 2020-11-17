import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { reducer as roomReducer } from '../features/room/roomSlice';
import { reducer as roomControlsReducer } from '../features/roomControls/roomControlsSlice';
import * as Sentry from '@sentry/react';

const appReducer = combineReducers({
  room: roomReducer,
  roomControls: roomControlsReducer,
});
export type RootState = ReturnType<typeof appReducer>;

const sentryEnhancer = Sentry.createReduxEnhancer();

const store = configureStore({
  reducer: appReducer,
  enhancers: [sentryEnhancer],
  devTools: true,
});

export default store;
