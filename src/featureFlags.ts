import { flagg, localStore } from 'flagg';

const flagDefinitions = {
  mockUsers: {
    description: 'Allows creating Mock User widgets',
  },
  pictureInPicture: {
    description: 'Lets you see the room while the window is backgrounded',
  },
  inviteLink: {
    description: 'Displays the invite link ui',
  },
  signup: {
    description: 'Open the floodgates!',
  },
  verticalTaskbar: {
    description: 'Makes the large-sized taskbar vertical',
  },
};

export type FeatureFlagName = keyof typeof flagDefinitions;

export const featureFlags = flagg({
  store: localStore(),
  definitions: flagDefinitions,
});
