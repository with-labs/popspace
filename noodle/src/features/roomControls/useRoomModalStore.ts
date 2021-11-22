import create from 'zustand';
import { combine } from 'zustand/middleware';

type RoomModalsState = {
  settings: boolean;
  userSettings: boolean;
  changelog: boolean;
  onboarding: boolean;
  actionBar: boolean;
  signUp: boolean;
  confirmCode: boolean;
  unsavedMeeeting: boolean;
  userEntry: boolean;
  supportedBrowsers: boolean;
};

export const useRoomModalStore = create(
  combine(
    {
      settings: false,
      userSettings: false,
      changelog: false,
      onboarding: false,
      actionBar: false,
      signUp: false,
      confirmCode: false,
      unsavedMeeeting: false,
      userEntry: false,
      supportedBrowsers: false,
    } as RoomModalsState,
    (set, get) => ({
      api: {
        openModal(modalName: keyof RoomModalsState) {
          set({
            [modalName]: true,
          });
        },
        closeModal(modalName: keyof RoomModalsState) {
          set({
            [modalName]: false,
          });
        },
        toggleModal(modalName: keyof RoomModalsState) {
          set({
            [modalName]: !get()[modalName],
          });
        },
      },
    })
  )
);
