import { flagg, sessionStore } from 'flagg';

const flagDefinitions = {
  roomMembers: {},
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: sessionStore(),
  definitions: flagDefinitions,
});
