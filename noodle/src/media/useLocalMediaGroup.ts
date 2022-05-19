import create from 'zustand';
import { combine } from 'zustand/middleware';

/**
 * Global storage for specifying which media group
 * the local client is a member of
 */
export const useLocalMediaGroup = create(
  combine(
    {
      localMediaGroup: null as string | null,
    },
    (set) => ({
      setLocalMediaGroup: (group: string | null) => set({ localMediaGroup: group }),
    })
  )
);
