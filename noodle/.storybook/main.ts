import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-links'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
};

export default config;
