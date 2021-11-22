import { logger } from '@utils/logger';
import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useMediaReadiness = create(
  combine(
    {
      isReady: false,
    },
    (set) => {
      const api = {
        onReady: () => {
          set({ isReady: true });
          logger.debug('Media autoplay unlocked');
        },
      };

      if (typeof window !== 'undefined') {
        // subscribe to global gesture handlers to detect when autoplay
        // can happen, then play a dummy audio context to unlock it
        async function unlock() {
          const ctx = createAudioContext();
          if (!ctx) return;
          await ctx.resume();
          api.onReady();
          window.document.removeEventListener('click', unlock);
          window.document.removeEventListener('touchstart', unlock);
          window.document.removeEventListener('touchend', unlock);
          window.document.removeEventListener('keydown', unlock);
        }

        window.document.addEventListener('click', unlock);
        window.document.addEventListener('touchstart', unlock);
        window.document.addEventListener('touchend', unlock);
        window.document.addEventListener('keydown', unlock);
      }

      return api;
    }
  )
);

function createAudioContext(): AudioContext | null {
  if (typeof AudioContext !== 'undefined') {
    return new AudioContext();
    // @ts-ignore
  } else if (typeof webkitAudioContext !== 'undefined') {
    // @ts-ignore
    return new webkitAudioContext();
  }
  return null;
}
