import { StickyNoteWidget } from './StickyNoteWidget';
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

const Template: Story<{ text: string; isDraft: boolean }> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={500}>
    <StickyNoteWidget
      onClose={() => {}}
      state={{
        id: 'example',
        kind: 'widget',
        participantSid: 'me',
        isDraft: args.isDraft,
        type: WidgetType.StickyNote,
        data: {
          text: args.text,
          author: 'me',
        },
      }}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  text: 'Hello world!',
  isDraft: false,
};

export const Draft = Template.bind({});
Draft.args = {
  text: '',
  isDraft: true,
};
