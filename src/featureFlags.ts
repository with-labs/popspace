import { flagg, localStore } from 'flagg';

const flagDefinitions = {
  mockUsers: {
    description: 'Allows creating Mock User widgets',
  },
  inviteLink: {
    description: 'Displays the invite link ui',
  },
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: localStore(),
  definitions: flagDefinitions,
});
