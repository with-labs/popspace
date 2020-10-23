import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { RoomControls } from './RoomControls';
import { withViewport } from '../../../stories/__decorators__/withViewport';

export default {
  title: 'room/Accessories',
  component: RoomControls,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<{}> = (args) => <RoomControls />;

export const Default = Template.bind({});
