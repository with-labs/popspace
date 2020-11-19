import { flagg, localStore } from 'flagg';

const flagDefinitions = {
  fileDrop: {
    description: 'Allows drag-and-drop file uploads in the room',
  },
  exportRoom: {
    description: 'Controls ability to export and import rooms from file',
  },
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: localStore(),
  definitions: flagDefinitions,
});
