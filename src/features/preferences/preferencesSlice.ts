import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../state/store';

export type PreferencesState = {
  /** The ID of the active camera device. undefined means unselected (use default) */
  activeCameraId: string | undefined;
  /** The ID of the active mic device. undefined means unselected (use default) */
  activeMicId: string | undefined;
};

const initialState: PreferencesState = {
  activeCameraId: undefined,
  activeMicId: undefined,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setActiveCamera(state, { payload }: PayloadAction<{ deviceId: string }>) {
      state.activeCameraId = payload.deviceId;
    },
    setActiveMic(state, { payload }: PayloadAction<{ deviceId: string }>) {
      state.activeMicId = payload.deviceId;
    },
  },
});

export const { actions, reducer } = preferencesSlice;

export const selectors = {
  selectActiveCameraId: (state: RootState) => state.preferences.activeCameraId,
  selectActiveMicId: (state: RootState) => state.preferences.activeMicId,
};
