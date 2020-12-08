import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { AudioIndicator } from './AudioIndicator';

export default {
  title: 'components/AudioIndicator',
  component: AudioIndicator,
  argTypes: {},
};

const Template: Story<{ isActive: boolean; isPaused: boolean; variant: 'sine' | 'flat' }> = (args) => (
  <AudioIndicator {...args} />
);

export const Default = Template.bind({});
Default.args = {
  isActive: true,
  isPaused: false,
};

export const Paused = Template.bind({});
Paused.args = {
  isActive: true,
  isPaused: true,
};

export const Stopped = Template.bind({});
Stopped.args = {
  isActive: false,
  isPaused: false,
};

export const Sine = Template.bind({});
Sine.args = {
  variant: 'sine',
  isActive: true,
  isPaused: false,
};
