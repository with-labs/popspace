import create from 'zustand';
import { combine } from 'zustand/middleware';

/**
 * A simple global store to track when an update is available
 * for the client code and is loaded by the registered service worker.
 * The user must close or reload all active tabs to apply the update.
 */
export const useUpdateStore = create(
  combine(
    {
      hasUpdate: false,
      updateAccepted: false,
    },
    (set) => ({
      api: {
        onUpdateReady: () => set({ hasUpdate: true }),
        onUpdate: () => set({ updateAccepted: true }),
      },
    })
  )
);
