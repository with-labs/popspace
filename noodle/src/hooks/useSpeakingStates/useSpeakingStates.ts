import create from 'zustand';
import { combine } from 'zustand/middleware';
import { omit } from 'lodash';

/**
 * Hook into a global Zustand store which tracks speaking state of each user
 * by their media participant id.
 */
export const useSpeakingStates = create(
  combine(
    {
      isSpeaking: {} as Record<string, boolean>,
    },
    (set, get) => ({
      api: {
        set: (id: string, isSpeaking: boolean) =>
          set({
            isSpeaking: {
              ...get().isSpeaking,
              [id]: isSpeaking,
            },
          }),
        remove: (id: string) =>
          set({
            isSpeaking: omit(get().isSpeaking, id),
          }),
      },
    })
  )
);
