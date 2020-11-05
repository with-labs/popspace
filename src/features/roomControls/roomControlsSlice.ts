import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../state/store';

const initialState = {
  isWallpaperModalOpen: false,
  isMembershipModalOpen: false,
  isUserSettingsModalOpen: false,
};

export const roomControlsSlice = createSlice({
  name: 'roomControls',
  initialState,
  reducers: {
    setIsWallpaperModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isWallpaperModalOpen = payload.isOpen;
    },
    setIsMembershipModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isMembershipModalOpen = payload.isOpen;
    },
    setIsUserSettingsModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isUserSettingsModalOpen = payload.isOpen;
    },
  },
});

export const { actions, reducer } = roomControlsSlice;

const selectIsWallpaperModalOpen = (state: RootState) => state.roomControls.isWallpaperModalOpen;
const selectIsMembershipModalOpen = (state: RootState) => state.roomControls.isMembershipModalOpen;
const selectIsUserSettingsModalOpen = (state: RootState) => state.roomControls.isUserSettingsModalOpen;

export const selectors = {
  selectIsMembershipModalOpen,
  selectIsUserSettingsModalOpen,
  selectIsWallpaperModalOpen,
};
