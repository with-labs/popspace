import { flagg, localStore } from 'flagg';

const flagDefinitions = {
  fileDrop: {
    description: 'Allows drag-and-drop file uploads in the room',
  },
  exportRoom: {
    description: 'Controls ability to export and import rooms from file',
  },
  multitouchZoomDamping: {
    description: 'Amount of damping to apply to multitouch pinch zoom gesture. More is slower.',
    default: 5,
  },
  touchpadZoomDamping: {
    description: 'Amount of damping to apply to touchpad pinch zoom gesture. More is slower.',
    default: 200,
  },
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: localStore(),
  definitions: flagDefinitions,
});
