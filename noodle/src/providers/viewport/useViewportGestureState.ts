import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useViewportGestureState = create(
  combine(
    {
      isGesturing: false,
    },
    (set) => ({
      api: {
        onGestureStart: () => set({ isGesturing: true }),
        onGestureEnd: () => set({ isGesturing: false }),
      },
    })
  )
);
