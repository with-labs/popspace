import create from 'zustand';
import { combine } from 'zustand/middleware';

export type OnboardingStateShape = {
  hasMoved: boolean;
  hasCreated: boolean;
  hasAcknowledgedPersistence: boolean;
  hasAcknowledgedMakeYourOwn: boolean;
};

const DEFAULT_STATE = {
  hasMoved: false,
  hasCreated: false,
  hasAcknowledgedPersistence: false,
  hasAcknowledgedMakeYourOwn: false,
};

const STORAGE_KEY = 'ndl_onboarding';

const loadState = () => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_STATE;
  try {
    return JSON.parse(stored) as OnboardingStateShape;
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_STATE;
  }
};

const saveState = ({ hasMoved, hasCreated, hasAcknowledgedPersistence }: OnboardingStateShape) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ hasMoved, hasCreated, hasAcknowledgedPersistence }));
};

export const useOnboarding = create(
  combine(loadState(), (set, get) => ({
    api: {
      markComplete: (step: keyof OnboardingStateShape) => {
        // bail early if the flag is already set, avoid writing state
        if (get()[step]) return;
        set({
          [step]: true,
        });
        saveState(get());
      },
      markAll: () => {
        set({
          hasMoved: true,
          hasCreated: true,
          hasAcknowledgedPersistence: true,
          hasAcknowledgedMakeYourOwn: true,
        });
        saveState(get());
      },
    },
  }))
);
