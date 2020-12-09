import create from 'zustand';
import { combine } from 'zustand/middleware';
import { omit } from 'lodash';

/**
 * Hook into a global Zustand store which tracks speaking state of each user
 * by their Twilio participant SID.
 */
export const useSpeakingStates = create(
  combine(
    {
      isSpeaking: {} as Record<string, boolean>,
    },
    (set, get) => ({
      api: {
        set: (participantSid: string, isSpeaking: boolean) =>
          set({
            isSpeaking: {
              ...get().isSpeaking,
              [participantSid]: isSpeaking,
            },
          }),
        remove: (participantSid: string) =>
          set({
            isSpeaking: omit(get().isSpeaking, participantSid),
          }),
      },
    })
  )
);
