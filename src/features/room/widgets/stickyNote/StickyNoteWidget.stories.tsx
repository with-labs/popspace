import { StickyNoteWidget, IStickyNoteWidgetProps } from './StickyNoteWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { WidgetType } from '../../../../types/room';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';

export default {
  title: 'widgets/StickyNote',
  component: StickyNoteWidget,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<IStickyNoteWidgetProps> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <StickyNoteWidget {...args} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  state: {
    id: 'example',
    kind: 'widget',
    participantSid: 'me',
    isDraft: false,
    type: WidgetType.StickyNote,
    data: {
      text: 'Hello world!',
      author: 'me',
    },
  },
  onClose: () => {},
};

export const Draft = Template.bind({});
Draft.args = {
  state: {
    id: 'example',
    kind: 'widget',
    participantSid: 'me',
    isDraft: true,
    type: WidgetType.StickyNote,
    data: {
      text: '',
      author: '',
    },
  },
  onClose: () => {},
};
