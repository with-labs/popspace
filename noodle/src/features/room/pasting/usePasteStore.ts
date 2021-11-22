import create from 'zustand';
import { combine } from 'zustand/middleware';

/**
 * Simple store to hold any pasted content while we prompt the user to
 * decide if they want to add it or cancel
 */
export const usePasteStore = create(
  combine(
    {
      pastedText: null as string | null,
      pastedFiles: null as File[] | null,
    },
    (set, get) => ({
      api: {
        setText: (text: string) =>
          set({
            pastedText: text,
            pastedFiles: null,
          }),
        setFiles: (files: File[]) =>
          set({
            pastedFiles: files,
            pastedText: null,
          }),
        clear: () => set({ pastedText: null, pastedFiles: null }),
      },
    })
  )
);
