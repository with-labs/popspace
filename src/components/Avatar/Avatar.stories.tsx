import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Avatar } from './Avatar';
import { options } from '../../utils/AvatarOptions';

export default {
  title: 'components/Avatar',
  component: Avatar,
  argTypes: {
    name: {
      control: {
        type: 'select',
        options: options.map((opt) => opt.name),
      },
    },
  },
};

const Template: Story<{
  name: string;
}> = (args) => <Avatar {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'blobby',
};
