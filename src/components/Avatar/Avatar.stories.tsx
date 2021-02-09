import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Avatar } from './Avatar';

export default {
  title: 'components/Avatar',
  component: Avatar,
  argTypes: {
    name: {
      control: {
        type: 'select',
        options: ['blobby', 'millie'],
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
