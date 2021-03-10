import create from 'zustand';
import { combine } from 'zustand/middleware';

type RoomModalsState = {
  settings: boolean;
  userSettings: boolean;
  changelog: boolean;
  onboarding: boolean;
  actionBar: boolean;
};

export const useRoomModalStore = create(
  combine(
    {
      settings: false,
      userSettings: false,
      changelog: false,
      onboarding: false,
      actionBar: false,
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
