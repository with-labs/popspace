import { flagg, localStore } from 'flagg';

const flagDefinitions = {
  mockUsers: {
    description: 'Allows creating Mock User widgets',
  },
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: localStore(),
  definitions: flagDefinitions,
});
