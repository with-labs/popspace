import { flagg, localStore } from 'flagg';

const flagDefinitions = {
  roomMembers: {},
  fileDrop: {},
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: localStore(),
  definitions: flagDefinitions,
});
