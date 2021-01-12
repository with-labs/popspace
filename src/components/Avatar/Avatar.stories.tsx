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
        options: Object.keys(options).reduce(function (r, k) {
          return r.concat(options[k].map((avatar) => avatar.name));
        }, [] as string[]),
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
