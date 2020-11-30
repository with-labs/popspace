import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../state/store';

const initialState = {
  isRoomSettingsModalOpen: false,
  isUserSettingsModalOpen: false,
  isChangelogModalOpen: false,
  isOnboardingModalOpen: false,
};

export const roomControlsSlice = createSlice({
  name: 'roomControls',
  initialState,
  reducers: {
    setIsRoomSettingsModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isRoomSettingsModalOpen = payload.isOpen;
    },
    setIsUserSettingsModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isUserSettingsModalOpen = payload.isOpen;
    },
    setIsChangelogModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isChangelogModalOpen = payload.isOpen;
    },
    setIsOnboardingModalOpen(state, { payload }: PayloadAction<{ isOpen: boolean }>) {
      state.isOnboardingModalOpen = payload.isOpen;
    },
  },
});

export const { actions, reducer } = roomControlsSlice;

const selectIsRoomSettingsModalOpen = (state: RootState) => state.roomControls.isRoomSettingsModalOpen;
const selectIsUserSettingsModalOpen = (state: RootState) => state.roomControls.isUserSettingsModalOpen;
const selectIsChangelogModalOpen = (state: RootState) => state.roomControls.isChangelogModalOpen;
const selectIsOnboardingModalOpen = (state: RootState) => state.roomControls.isOnboardingModalOpen;

export const selectors = {
  selectIsUserSettingsModalOpen,
  selectIsChangelogModalOpen,
  selectIsOnboardingModalOpen,
  selectIsRoomSettingsModalOpen,
};
